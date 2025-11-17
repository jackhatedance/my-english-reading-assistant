import { Button } from './button.cjs'
import { Select } from './select.cjs'
import { Switch } from './switch.cjs'

export function elButton(root) {
    return new Button(root);
}

export function elSelect(root) {
    return new Select(root);
}

export function elSwitch(root) {
    return new Switch(root);
}

