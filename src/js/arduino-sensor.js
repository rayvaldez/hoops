export class ArduinoSensor {
    constructor({
        onShot = () => {},
        onStatusChange = () => {},
        cooldownMs = 700
    } = {}) {
        this.onShot = onShot;
        this.onStatusChange = onStatusChange;
        this.cooldownMs = cooldownMs;

        this.port = null;
        this.reader = null;
        this.readTask = null;
        this.connected = false;
        this.buffer = "";
        this.lastShotTime = 0;
    }

    setStatus(message) {
        this.onStatusChange(message);
    }

    async connect() {
        if (!("serial" in navigator)) {
            this.setStatus(
                "Web Serial unavailable. Use desktop Chrome on localhost."
            );
            return;
        }

        if (this.connected) return;

        try {
            this.setStatus("Select your Arduino port...");

            // Must be called from a user click the first time.
            const port = await navigator.serial.requestPort();

            await port.open({ baudRate: 115200 });

            this.port = port;
            this.connected = true;
            this.buffer = "";

            this.setStatus("Arduino connected — ready to shoot");

            this.readTask = this.readArduinoSerial();
        } catch (error) {
            console.error("Arduino connection error:", error);
            this.connected = false;
            this.port = null;
            this.setStatus("Connection failed: " + error.message);
        }
    }

    async readArduinoSerial() {
        const decoder = new TextDecoder();

        try {
            while (this.connected && this.port?.readable) {
                this.reader = this.port.readable.getReader();

                try {
                    while (this.connected) {
                        const { value, done } =
                            await this.reader.read();

                        if (done) break;

                        this.buffer += decoder.decode(value, {
                            stream: true
                        });

                        const lines = this.buffer.split(/\r?\n/);
                        this.buffer = lines.pop() ?? "";

                        for (const line of lines) {
                            this.handleMessage(line.trim());
                        }
                    }
                } finally {
                    this.reader.releaseLock();
                    this.reader = null;
                }

                break;
            }
        } catch (error) {
            if (this.connected) {
                console.error("Arduino serial error:", error);
            }
        } finally {
            const wasConnected = this.connected;
            this.connected = false;
            this.reader = null;

            if (wasConnected) {
                this.setStatus("Arduino disconnected");
            }
        }
    }

    handleMessage(message) {
        if (message !== "SHOT" || !this.connected) return;

        const now = Date.now();

        // Ignore extra sensor triggers caused by net recoil.
        if (now - this.lastShotTime < this.cooldownMs) {
            return;
        }

        this.lastShotTime = now;
        this.onShot();
    }

    async disconnect() {
        this.connected = false;

        try {
            if (this.reader) {
                await this.reader.cancel();
            }

            if (this.readTask) {
                await this.readTask;
            }

            if (this.port) {
                await this.port.close();
            }
        } catch (error) {
            console.warn("Arduino cleanup:", error);
        } finally {
            this.reader = null;
            this.readTask = null;
            this.port = null;
            this.buffer = "";
            this.setStatus("Arduino disconnected");
        }
    }
}
