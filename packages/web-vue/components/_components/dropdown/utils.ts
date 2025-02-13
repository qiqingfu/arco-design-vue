import { VNode, isVNode } from 'vue';
import { isArray, isFunction, isObject } from '../../_utils/is';
import {
  getBooleanProp,
  getChildrenFunc,
  getVNodeChildrenString,
  isArrayChildren,
  isNamedComponent,
  isSlotsChildren,
  resolveProps,
} from '../../_utils/vue-utils';
import {
  Option,
  OptionData,
  OptionInfo,
  GroupOption,
  FilterOption,
  OptionNode,
} from './interface';

const isGroupOption = (option: Option): option is GroupOption => {
  return isObject(option) && 'isGroup' in option;
};

export const getOptionNodes = ({
  children,
  options,
  extraOptions,
  inputValue,
  filterOption,
  optionInfoMap,
  enabledOptionSet,
}: {
  children?: VNode[];
  options?: Option[];
  extraOptions?: Array<string | number>;
  inputValue?: string;
  filterOption?: FilterOption;
  optionInfoMap: Map<string | number, OptionInfo>;
  enabledOptionSet: Set<string | number>;
}) => {
  const nodes: OptionNode[] = [];

  const getAndSaveOptionInfo = (
    option: string | number | OptionData | VNode,
    origin: 'children' | 'options' | 'extraOptions'
  ): OptionInfo | undefined => {
    const index = optionInfoMap.size;

    let optionInfo: OptionInfo;
    if (isVNode(option)) {
      const props = resolveProps(option);
      const label = props.label ?? getVNodeChildrenString(option);
      const value = props.value ?? label;
      const render = getChildrenFunc(option);
      const key = `option-${typeof value}-${value}`;

      optionInfo = {
        ...props,
        index,
        key,
        value,
        label,
        render,
        disabled: getBooleanProp(option.props?.disabled),
        origin: 'children',
      };
    } else {
      optionInfo = isObject(option)
        ? {
            ...option,
            index,
            key: `option-${typeof option.value}-${option.value}`,
            value: option.value,
            label: option.label ?? String(option.value),
            disabled: Boolean(option.disabled),
            origin,
          }
        : {
            index,
            key: `option-${typeof option}-${option}`,
            value: option,
            label: String(option),
            disabled: false,
            origin,
          };
    }

    // Duplicate value is no longer added
    if (optionInfoMap.get(optionInfo.value)) {
      return undefined;
    }

    optionInfoMap.set(optionInfo.value, optionInfo);
    return optionInfo;
  };

  const isValidOption = (optionInfo: OptionInfo) => {
    if (isFunction(filterOption)) {
      return !inputValue || filterOption(inputValue, optionInfo);
    }

    if (filterOption) {
      return optionInfo.label
        .toLowerCase()
        .includes((inputValue ?? '').toLowerCase());
    }

    return true;
  };

  const extendChildrenFromOptions = (
    options: Option[],
    origin: 'options' | 'extraOptions'
  ) => {
    for (const item of options) {
      if (isGroupOption(item)) {
        if (isArray(item.options) && item.options.length > 0) {
          nodes.push({
            type: 'optGroup',
            key: `group-${item.label}`,
            label: item.label,
          });
          extendChildrenFromOptions(item.options, origin);
        }
      } else {
        const optionInfo = getAndSaveOptionInfo(item, origin);
        if (optionInfo && isValidOption(optionInfo)) {
          nodes.push({
            type: 'option',
            key: optionInfo.key,
            value: optionInfo.value,
            label: optionInfo.label,
            render: optionInfo.render,
            disabled: optionInfo.disabled,
          });
          if (!optionInfo.disabled) {
            enabledOptionSet.add(optionInfo.value);
          }
        }
      }
    }
  };

  const travelChildren = (children: VNode[]) => {
    for (const child of children) {
      if (isNamedComponent(child, 'Optgroup')) {
        // OptGroup处理
        nodes.push({
          type: 'optGroup',
          key: `group-${child.props?.label}`,
          label: child.props?.label,
        });
        // 添加Group下面的Options
        if (isSlotsChildren(child, child.children)) {
          const _children = child.children.default?.() ?? [];
          travelChildren(_children);
        } else if (isArrayChildren(child, child.children)) {
          travelChildren(child.children);
        }
      } else if (isNamedComponent(child, 'Option')) {
        // Option处理
        const optionInfo = getAndSaveOptionInfo(child, 'children');
        if (optionInfo && isValidOption(optionInfo)) {
          nodes.push({
            type: 'option',
            key: optionInfo.key,
            value: optionInfo.value,
            label: optionInfo.label,
            render: optionInfo.render,
            disabled: optionInfo.disabled,
          });
          if (!optionInfo.disabled) {
            enabledOptionSet.add(optionInfo.value);
          }
        }
      } else if (isArrayChildren(child, child.children)) {
        travelChildren(child.children);
      }
    }
  };

  if (children) {
    travelChildren(children);
  } else if (options) {
    extendChildrenFromOptions(options, 'options');
  }
  if (extraOptions) {
    extendChildrenFromOptions(extraOptions, 'extraOptions');
  }

  return nodes;
};
