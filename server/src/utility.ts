export function isEnum<EV, ET extends { [key: string]: EV }>(enumValue: EV, enumType: ET): enumValue is ET[keyof ET] {
  return Object.values(enumType).includes(enumValue);
}