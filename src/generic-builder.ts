import { GenericBuilderChain } from './interfaces/generic-builder';
import { IComponent, ComponentConstructor } from './interfaces/component';
import { Parent, Children } from './components/index';

function GenericBuilder<T>(
  getId: () => number,
  build: (id: number, ret: Array<T|string>, opts: Partial<T|undefined>[]) => void,
): GenericBuilderChain<T> {
  const id = getId();
  const members: Array<T|string> = [];
  const opts: Partial<T|undefined>[] = [];
  const children: Record<string, number> = {};
  const childBuilders: Array<GenericBuilderChain<IComponent>> = [];
  let childCounter = 0;
  const ret: GenericBuilderChain<T> = {
    fromJson: (data: Record<string, {}>) => {
      Object.keys(data).forEach((key) => {
        members.push(key);
        opts.push(data[key]);
      });
      return ret;
    },
    with: <T2 extends IComponent>(data: ComponentConstructor<T2>|string, options?: Partial<T2>) => {
      members.push(data as any as T);
      opts.push(options as Partial<T>);
      return ret;
    },
    withChild: (
      name: string,
      callback: (child: GenericBuilderChain<T>, parentId: number) => GenericBuilderChain<T>,
    ) => {
      const childBuilder = GenericBuilder(getId, build);
      childCounter += 1;
      childBuilder.with(Parent, {
        entityId: id,
      });
      callback(childBuilder, id);
      children[name] = id+1;
      childBuilders.push(childBuilder);
      return ret;
    },
    build: () => {
      if (childCounter > 0) {
        ret.with(Children, {
          children: children,
        });
      }
      build(id, members, opts);
      childBuilders.forEach((b) => b.build());
      return id;
    },
  };
  return ret;
}

export default GenericBuilder;
