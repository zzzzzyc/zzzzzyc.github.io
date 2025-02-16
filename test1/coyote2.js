const noble = require('@abandonware/noble');

const BLE_DEVICE_NAME = "D-LAB ESTIM01";

const SERVICE_A_UUID = "955a180a-0fe2-f5aa-a094-84b8d4f3e8ad";
const BATTERY_LEVEL_UUID = "955a1500-0fe2-f5aa-a094-84b8d4f3e8ad";
const PWM_AB2_UUID = "955a1504-0fe2-f5aa-a094-84b8d4f3e8ad";
const PWM_A34_UUID = "955a1505-0fe2-f5aa-a094-84b8d4f3e8ad";
const PWM_B34_UUID = "955a1506-0fe2-f5aa-a094-84b8d4f3e8ad";

class Coyote2Error extends Error {}
class AlreadyConnectedError extends Coyote2Error {}
class NotConnectedError extends Coyote2Error {}
class DeviceIsNotCoyote20Error extends Coyote2Error {}
class DeviceNotFoundError extends Coyote2Error {}

class Coyote2 {
    constructor(address = null) {
        this.address = address;
        this.peripheral = null;
    }

    async findDevice(timeout) {
        return new Promise((resolve, reject) => {
            noble.startScanning([], false);
            noble.on('discover', (peripheral) => {
                if (peripheral.advertisement.localName === BLE_DEVICE_NAME) {
                    this.address = peripheral.address;
                    this.peripheral = peripheral;
                    noble.stopScanning();
                    resolve(true);
                }
            });

            setTimeout(() => {
                noble.stopScanning();
                resolve(false);
            }, timeout);
        });
    }

    isConnected() {
        return this.peripheral && this.peripheral.state === 'connected';
    }

    async connect() {
        if (!this.address) {
            throw new DeviceNotFoundError('Device address is not specified.');
        }

        if (this.isConnected) {
            throw new AlreadyConnectedError('Already connected to the device.');
        }

        return new Promise((resolve, reject) => {
            this.peripheral.connect(async (error) => {
                if (error) {
                    reject(new Error('Failed to connect to the device.'));
                    return;
                }

                this.peripheral.discoverServices([SERVICE_A_UUID], (error, services) => {
                    if (error || services.length === 0) {
                        this.disconnect();
                        reject(new DeviceIsNotCoyote20Error('Service A UUID not found.'));
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.peripheral) {
                this.peripheral.disconnect((error) => {
                    if (error) {
                        reject(new Error('Failed to disconnect from the device.'));
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    async getBatteryLevel() {
        this.checkConnection();

        return this.readCharacteristic(BATTERY_LEVEL_UUID).then(data => data[0]);
    }

    async getStrength() {
        this.checkConnection();

        const data = await this.readCharacteristic(PWM_AB2_UUID);
        const dataInt = data.readUIntLE(0, 3);
        const realStrengthA = dataInt >> 13;
        const realStrengthB = (dataInt >> 2) & 0x7FF;

        return [realStrengthA / 11, realStrengthB / 11];
    }

    async writeStrength(strengthA, strengthB) {
        const realStrengthA = Math.floor(strengthA * 11);
        const realStrengthB = Math.floor(strengthB * 11);

        await this.writeRealStrength(realStrengthA, realStrengthB);
    }

    async writeRealStrength(realStrengthA, realStrengthB) {
        if (realStrengthA < 0 || realStrengthA > 2047 || realStrengthB < 0 || realStrengthB > 2047) {
            throw new Error('Invalid strength values.');
        }

        this.checkConnection();

        let dataInt = 0;
        dataInt += realStrengthA;
        dataInt <<= 11;
        dataInt += realStrengthB;
        dataInt <<= 2;

        const buffer = Buffer.alloc(3);
        buffer.writeUIntLE(dataInt, 0, 3);

        return this.writeCharacteristic(PWM_AB2_UUID, buffer);
    }

    async readWave(uuid) {
        this.checkConnection();

        const data = await this.readCharacteristic(uuid);
        const dataInt = data.readUIntLE(0, 3);
        const x = dataInt >> 19;
        const y = (dataInt >> 9) & 0x3FF;
        const z = (dataInt >> 2) & 0x1F;

        return [x, y, z];
    }

    async writeWave(uuid, x, y, z) {
        if (x < 0 || x > 31 || y < 0 || y > 1023 || z < 0 || z > 31) {
            throw new Error('Invalid wave values.');
        }

        this.checkConnection();

        let dataInt = 0;
        dataInt += x;
        dataInt <<= 10;
        dataInt += y;
        dataInt <<= 5;
        dataInt += z;
        dataInt <<= 2;

        const buffer = Buffer.alloc(3);
        buffer.writeUIntLE(dataInt, 0, 3);

        return this.writeCharacteristic(uuid, buffer);
    }

    async readWaveA() {
        return this.readWave(PWM_A34_UUID);
    }

    async writeWaveA(x, y, z) {
        return this.writeWave(PWM_A34_UUID, x, y, z);
    }

    async readWaveB() {
        return this.readWave(PWM_B34_UUID);
    }

    async writeWaveB(x, y, z) {
        return this.writeWave(PWM_B34_UUID, x, y, z);
    }

    checkConnection() {
        if (!this.isConnected) {
            throw new NotConnectedError('Not connected to the device.');
        }
    }

    readCharacteristic(uuid) {
        return new Promise((resolve, reject) => {
            this.peripheral.discoverSomeServicesAndCharacteristics([], [uuid], (error, services, characteristics) => {
                if (error) {
                    reject(error);
                    return;
                }

                const characteristic = characteristics[0];
                characteristic.read((error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
    }

    writeCharacteristic(uuid, data) {
        return new Promise((resolve, reject) => {
            this.peripheral.discoverSomeServicesAndCharacteristics([], [uuid], (error, services, characteristics) => {
                if (error) {
                    reject(error);
                    return;
                }

                const characteristic = characteristics[0];
                characteristic.write(data, false, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }
}

module.exports = Coyote2;
