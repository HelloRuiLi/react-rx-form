import { filter, get, map, set, size, times } from "lodash";
import React, { ReactNode, useContext, useLayoutEffect, useState } from "react";
import { IFieldArrayCoreState, TChildrenRender, TFieldValue } from "./__types__/interfaces";
import { FormContext, FormProvider } from "./FormContext";

interface IFieldArrayInnerProps extends IFieldArrayCoreState {
  add: () => any;
  remove: (idx: number) => any;
  each: (mapper: (fieldName: string, idx: number) => ReactNode) => ReactNode;
}

interface IFieldArrayProps {
  name: string;
  children: TChildrenRender<IFieldArrayInnerProps>;
  initLength?: number;
}

export function FieldArrayCore(props: IFieldArrayProps) {
  const { getFormValues, updateFormValues } = useContext(FormContext);
  const getFieldsByIdx = (): string[] => {
    return map(get(getFormValues(), props.name), (_, idx: number) => `[${idx}]`);
  };

  const [fields, setFields] = useState(getFieldsByIdx());

  useLayoutEffect(() => {
    const fieldArrayValues = get(getFormValues(), props.name);
    if (props.initLength) {
      times(props.initLength - size(fieldArrayValues), add);
    }
    return () => {};
  }, []);

  const remove = (idx: number) => {
    const formValues = getFormValues();
    const newFieldArrayValues = filter(get(formValues, props.name), (_, n: number) => {
      return n !== idx;
    });

    const nextFormValues = set(formValues, props.name, newFieldArrayValues);
    updateFormValues(nextFormValues);

    setFields(getFieldsByIdx());
  };

  const add = () => {
    const formValues = getFormValues();
    const nextFormValues = set(formValues, props.name, get(formValues, props.name, []).concat(undefined));

    updateFormValues(nextFormValues);

    setFields(getFieldsByIdx());
  };

  const each = (mapper: (prefix: string, idx: number) => React.ReactNode) => {
    const fieldValues = get(getFormValues(), props.name);
    return map(fieldValues, (_: TFieldValue, idx: number) => {
      const name = `[${idx}]`;
      return mapper(name, idx);
    });
  };

  return props.children({
    fields,
    add,
    each,
    remove: (idx: number) => remove(idx),
  });
}

export const FieldArray = React.forwardRef((props: IFieldArrayProps) => {
  const formContext = useContext(FormContext);
  const name = `${formContext.fieldPrefix || ""}${props.name}`;
  return (
    <FormProvider
      value={{
        ...formContext,
        fieldPrefix: name,
      }}
    >
      <FieldArrayCore {...props} name={name} />
    </FormProvider>
  );
});
