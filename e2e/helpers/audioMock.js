/**
 * Injects a mock implementation of window.AudioContext and window.webkitAudioContext
 * to record audio operations to window.__audioAudit.
 *
 * @param {import('@playwright/test').Page} page - The Playwright Page object.
 */
export async function setupAudioSpy(page) {
  await page.addInitScript(() => {
    // Initialize audit array if not exists
    window.__audioAudit = window.__audioAudit || [];

    // Mock AudioContext class
    class MockAudioContext {
      constructor() {
        this.state = 'running';
        this.destination = {};
        this._startTime = Date.now();
      }

      get currentTime() {
        return (Date.now() - this._startTime) / 1000;
      }

      close() {
        this.state = 'closed';
        return Promise.resolve();
      }

      resume() {
        this.state = 'running';
        return Promise.resolve();
      }

      suspend() {
        this.state = 'suspended';
        return Promise.resolve();
      }

      createOscillator() {
        const osc = {
          type: 'sine',
          frequency: (() => {
            let _val = 440;
            return {
              get value() {
                return _val;
              },
              set value(val) {
                _val = val;
                window.__audioAudit.push({
                  type: 'oscillator-frequency',
                  value: val,
                  timestamp: Date.now()
                });
              },
              setValueAtTime: (val, time) => {
                _val = val;
                window.__audioAudit.push({
                  type: 'oscillator-frequency',
                  value: val,
                  time: time,
                  timestamp: Date.now()
                });
              }
            };
          })(),
          connect: function (destination) {
            this.connectedTo = destination;
          },
          disconnect: function () {
            this.connectedTo = null;
          },
          start: function (time) {
            this.started = time || 0;
            window.__audioAudit.push({
              type: 'oscillator-start',
              waveform: this.type,
              frequency: this.frequency.value,
              time: time,
              timestamp: Date.now()
            });
          },
          stop: function (time) {
            this.stopped = time || 0;
            window.__audioAudit.push({
              type: 'oscillator-stop',
              time: time,
              timestamp: Date.now()
            });
          }
        };

        // Wrap oscillator with Proxy to spy on property setters (like oscillator.type)
        return new Proxy(osc, {
          set(target, prop, value) {
            if (prop === 'type') {
              target.type = value;
              window.__audioAudit.push({
                type: 'oscillator-type',
                value: value,
                timestamp: Date.now()
              });
            } else {
              target[prop] = value;
            }
            return true;
          }
        });
      }

      createGain() {
        return {
          gain: (() => {
            let _val = 1.0;
            return {
              get value() {
                return _val;
              },
              set value(val) {
                _val = val;
                window.__audioAudit.push({
                  type: 'gain-value',
                  value: val,
                  timestamp: Date.now()
                });
              },
              setValueAtTime: (val, time) => {
                _val = val;
                window.__audioAudit.push({
                  type: 'gain-value',
                  value: val,
                  time: time,
                  timestamp: Date.now()
                });
              },
              exponentialRampToValueAtTime: (val, time) => {
                _val = val;
                window.__audioAudit.push({
                  type: 'gain-ramp',
                  value: val,
                  time: time,
                  timestamp: Date.now()
                });
              },
              linearRampToValueAtTime: (val, time) => {
                _val = val;
                window.__audioAudit.push({
                  type: 'gain-ramp-linear',
                  value: val,
                  time: time,
                  timestamp: Date.now()
                });
              }
            };
          })(),
          connect: function (destination) {
            this.connectedTo = destination;
          },
          disconnect: function () {
            this.connectedTo = null;
          }
        };
      }

      createBiquadFilter() {
        return {
          frequency: { value: 350, setValueAtTime: () => {} },
          Q: { value: 1 },
          connect: () => {},
          disconnect: () => {}
        };
      }

      createDynamicsCompressor() {
        return {
          threshold: { value: -24 },
          knee: { value: 30 },
          ratio: { value: 12 },
          reduction: { value: 0 },
          attack: { value: 0.003 },
          release: { value: 0.25 },
          connect: () => {},
          disconnect: () => {}
        };
      }

      createAnalyser() {
        return {
          fftSize: 2048,
          frequencyBinCount: 1024,
          getByteFrequencyData: () => {},
          getByteTimeDomainData: () => {},
          connect: () => {},
          disconnect: () => {}
        };
      }
    }

    // Expose the mock AudioContext constructor
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
  });
}
