import { isEqual } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { FormConsumer } from "./FormContext";
import {
  IFormState,
  IFormValues,
  IFormValuesCommonProps,
  IFormValuesCoreProps,
  IFormValuesCoreState,
} from "./interfaces";

class FormValuesCore extends React.Component<IFormValuesCoreProps, IFormValuesCoreState> {
  subscription: Subscription | null = null;
  state = {
    formValues: {} as IFormValues,
  };

  componentDidMount() {
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        map((formState: IFormState) => {
          return formState.values;
        }),
        distinctUntilChanged(isEqual),
        tap((formValues: IFormValues) => {
          this.setState({
            formValues,
          });
        }),
      )
      .subscribe();
    this.subscription = this.props.formContextValue.subscribe(formStateObserver$);
  }

  getFormValues = () => {
    return this.state.formValues;
  };

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  render() {
    return this.props.children({
      formValues: this.state.formValues,
      updateFormValues: this.props.formContextValue.updateFormValues,
    });
  }
}

export const FormValues = React.forwardRef((props: IFormValuesCommonProps, ref?: React.Ref<any>) => {
  return (
    <FormConsumer>
      {(formContextValue) => {
        return <FormValuesCore formContextValue={formContextValue} {...props} ref={ref} />;
      }}
    </FormConsumer>
  );
});
