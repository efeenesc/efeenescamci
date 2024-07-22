export class GetSetObj<T> {
  private val!: T;
  callback?: (newVal: T) => void | Promise<void>;

  constructor(_val: T, _callback?: (newVal: T) => void | Promise<void>) {
    this.val = _val;
    this.callback = _callback;
  }
  get value(): T {
    return this.val;
  }
  set value(value: T) {
    if (value === this.val) return;

    const callbackResult = this.callback?.(value);

    if (callbackResult instanceof Promise) {
      callbackResult.then(() => {
        this.val = value;
      }).catch((error) => {
        console.error("Error in callback:", error);
      });
    } else {
      this.val = value;
    }
  }
}