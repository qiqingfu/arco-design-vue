import { isArray, isUndefined } from '../_utils/is';
import { OptionInfo } from '../_components/dropdown/interface';
import { TagData } from '../input-tag/interface';

const getValueData = (
  value: string | number | undefined,
  optionInfoMap: Map<string | number, OptionInfo>
): TagData | undefined => {
  if (isUndefined(value)) {
    return undefined;
  }

  const optionInfo = optionInfoMap.get(value);

  if (!optionInfo) {
    return undefined;
  }

  return {
    ...optionInfo,
    label: optionInfo.label,
    closable: !optionInfo.disabled,
  };
};

export const getValueDataFromModelValue = (
  modelValue: string | number | Array<string | number>,
  optionInfoMap: Map<string | number, OptionInfo>
) => {
  if (isArray(modelValue)) {
    const result = [];
    for (const item of modelValue) {
      const valueData = getValueData(item, optionInfoMap);
      if (valueData) {
        result.push(valueData);
      }
    }
    return result;
  }
  return getValueData(modelValue, optionInfoMap);
};
