import { ComponentConstructor, IComponent } from './component';

export declare type GenericBuilderChain<T> = {
  fromJson: (data: Record<string, {}>) => GenericBuilderChain<T>,

  with: <T2 extends IComponent>(
    data: ComponentConstructor<T2>,
    options?: Partial<T2>
  ) => GenericBuilderChain<T>,

  withChild: (
    name: string,
    cb: (
      child: GenericBuilderChain<T>,
      parentId: number,
    ) => number
  ) => GenericBuilderChain<T>,

  build: () => number,
};
