const INFO = {
    submit: 'sub',
    reset: 'rst',
    button: 'btn',
};

export default {
    options: {
        autoByContent: true,
        displayAllowedValues: ['flex', 'inline-flex'],
        linkable: true,
    },
    editor: {
        label: {
            en: 'Button',
            fr: 'Bouton',
        },
        icon: 'cursor-click',
        infoTags: content => {
            if (content.buttonType && INFO[content.buttonType]) {
                return {
                    color: 'var(--ww-color-blue-500)',
                    backgroundColor: 'var(--ww-color-blue-100)',
                    text: INFO[content.buttonType].toUpperCase(),
                    action: () => {
                        wwLib.wwSearchBar.executeAction({
                            actions: wwLib.wwSearchBar.getEditSidebarActions('settings', 'custom-0'),
                        });
                    },
                };
            } else {
                return [];
            }
        },
        workflowHint: content => {
            if (content.buttonType !== 'submit') {
                return false;
            }

            return {
                type: 'warning',
                header: {
                    en: 'You probably shouldn’t trigger workflows on submit buttons.',
                    fr: 'Vous ne devriez pas déclencher un workflow depuis un bouton submit',
                },
                text: {
                    en: 'For your users to benefit from automatic form field validation, you should trigger submit workflows on the form container. Unless you are 100% sure of what you’re doing and want to bypass this behavior.',
                    fr: 'Pour que vos utilisateurs bénéficient de la validation automatique des champs de formulaire, vous devez déclencher des workflows de soumission sur le conteneur de formulaire. À moins que vous ne soyez sûr à 100 % de ce que vous faites et que vous souhaitiez contourner ce comportement.',
                },
                button: {
                    text: { en: 'Select form container', fr: 'Selectionnez le form container' },
                    action: 'selectParentFormContainer',
                },
            };
        },
    },
    states: ['focus', 'focus-visible', 'disabled', 'active', 'loading'],
    triggerEvents: [
        { name: 'focus', label: { en: 'On focus' }, event: null },
        { name: 'blur', label: { en: 'On blur' }, event: null },
        { name: 'keydown', label: { en: 'On key down' }, event: null },
        { name: 'keyup', label: { en: 'On key up' }, event: null },
    ],
    properties: {
        buttonType: {
            label: {
                en: 'Type',
                fr: 'Type',
            },
            type: 'TextSelect',
            section: 'settings',
            options: {
                options: [
                    { value: null, label: 'none' },
                    { value: 'button', label: 'Button' },
                    { value: 'submit', label: 'Submit Button' },
                ],
            },
            defaultValue: 'button',
            bindable: true,
            bindingValidation: {
                type: 'string',
                tooltip: 'A string that defines the button type: `"button" | "submit"`',
            },
        },
        form: {
            label: { en: 'Form ID' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            hidden: content => content?.buttonType !== 'submit',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'The ID of the form to submit (allows submitting a form from outside its container)',
            },
            propertyHelp: {
                tooltip:
                    'Enter the ID of the form this button should submit. This allows the button to work even when placed outside the form element.',
            },
            /* wwEditor:end */
        },
        disabled: {
            label: { en: 'Disabled' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean that defines if the button is disabled: `true | false`',
            },
            /* wwEditor:end */
        },
        isLoading: {
            label: { en: 'Loading' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean that defines if the button is in loading state: `true | false`',
            },
            /* wwEditor:end */
        },
        columnGap: {
            label: { en: 'Column gap' },
            type: 'Length',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 0, max: 200 },
                    { value: 'rem', label: 'rem', min: 0, max: 10 },
                    { value: '%', label: '%', min: 0, max: 100 },
                ],
                noRange: true,
                useVar: true,
            },
            defaultValue: '0px',
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Gap between columns (e.g. "8px", "1rem")',
            },
            /* wwEditor:end */
        },
        buttonContent: {
            hidden: true,
            defaultValue: [],
        },
    },
};
