import '@testing-library/jest-dom';

if (typeof Element !== 'undefined') {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}
if (typeof HTMLDivElement !== 'undefined') {
  HTMLDivElement.prototype.setPointerCapture = () => {};
  HTMLDivElement.prototype.releasePointerCapture = () => {};
}

if (typeof window !== 'undefined') {
  window.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this._clientX = params.clientX || 0;
      this._clientY = params.clientY || 0;
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || 'mouse';
    }
    get clientX() {
      return this._clientX;
    }
    get clientY() {
      return this._clientY;
    }
  };
}
