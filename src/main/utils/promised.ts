type Callable = (...args: any[]) => any;
type HeadArgsType<T extends any[]> = T extends [...infer Head, any] ? Head : any[];
// type TailArgsType<T extends any[]> = T extends [...any, infer Tail] ? Tail : any;
// type FirstArgType<F extends Callable> = F extends (first: infer A, last: any) => any ? A : never;
type LastArgType<F extends Callable> = F extends (first: any, last: infer A) => any ? A : never;
// type ArgumentTypes<F extends Callable> = F extends (...args: infer A) => any ? A : never;
// type ReturnType<F extends Callable> = F extends (...args: any[]) => infer R ? R : never;

export default <F extends (...args: any[]) => any>(fn: F, that: any, ...args: HeadArgsType<Parameters<F>>): Promise<LastArgType<LastArgType<F>>> =>
  new Promise((resolve, reject) => {
    fn.apply(
      that,
      args.concat((error: Error | null, result: LastArgType<LastArgType<F>>) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
    );
  });
