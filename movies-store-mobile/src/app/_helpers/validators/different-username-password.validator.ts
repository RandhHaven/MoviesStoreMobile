import { FormGroup } from '@angular/forms';

export function DifferentUsernamePassword(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.differentUsernamePassword) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value?.includes(matchingControl.value) || matchingControl.value?.includes(control.value)) {
      matchingControl.setErrors({ differentUsernamePassword: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}
