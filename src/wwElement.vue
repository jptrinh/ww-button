<template>
    <component
        :is="tag"
        class="ww-button"
        :class="{ button: tag, '-link': hasLink && !isEditing, active: isActive }"
        :type="buttonType"
        :form="formAttribute"
        :data-ww-flag="'btn-' + content.buttonType"
        :disabled="content.disabled"
        v-bind="properties"
        @focus="onFocus"
        @blur="onBlur($event)"
        @mousedown="onMouseActivate"
        @mouseup="onMouseDeactivate"
        @mouseleave="onMouseDeactivate"
        @touchstart="onTouchActivate"
        @touchend="onTouchDeactivate"
        @touchcancel="onTouchDeactivate"
        @keydown.enter="onKeyActivate"
        @keydown.space="onKeyActivate"
        @keyup.enter="onKeyDeactivate"
        @keyup.space="onKeyDeactivate"
        @keydown="onKeyDown"
        @keyup="onKeyUp"
    >
        <wwLayout path="buttonContent" direction="row" class="button-content" :style="buttonContentStyle" />
    </component>
</template>

<script>
import { computed } from 'vue';

export default {
    props: {
        content: { type: Object, required: true },
        wwFrontState: { type: Object, required: true },
        wwElementState: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: [
        'update:content',
        'update:content:effect',
        'change-menu-visibility',
        'change-borders-style',
        'add-state',
        'remove-state',
        'trigger-event',
    ],
    setup(props) {
        const {
            hasLink,
            tag: linkTag,
            properties,
        } = wwLib.wwElement.useLink({
            isDisabled: computed(() => props.content.disabled),
        });

        // Expose button state as local variables
        const localData = computed(() => ({
            isLoading: props.content?.isLoading || false,
        }));

        const markdown = `### Button Local Variables
- \`isLoading\`: Boolean - is button in loading state

Access via: \`context.local.data?.['button']?.isLoading\``;

        wwLib.wwElement.useRegisterElementLocalContext('button', localData, {}, markdown);

        return {
            hasLink,
            linkTag,
            properties,
        };
    },

    data() {
        return {
            isReallyFocused: false,
            isReallyFocusVisible: false,
            isReallyActive: false,
            _lastFocusByPointer: false,
        };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        tag() {
            if (this.isEditing) return 'div';
            if (this.hasLink) {
                return this.linkTag;
            }
            if (
                this.content.buttonType === 'submit' ||
                this.content.buttonType === 'reset' ||
                this.content.buttonType === 'button'
            )
                return 'button';
            return 'div';
        },
        buttonType() {
            if (this.isEditing || this.hasLink) return '';
            if (
                this.content.buttonType === 'submit' ||
                this.content.buttonType === 'reset' ||
                this.content.buttonType === 'button'
            )
                return this.content.buttonType;
            return '';
        },
        formAttribute() {
            if (this.buttonType !== 'submit') return null;
            return this.content?.form || null;
        },
        isFocused() {
            /* wwEditor:start */
            if (this.wwEditorState.isSelected) {
                return this.wwElementState.states.includes('focus');
            }
            /* wwEditor:end */
            return this.isReallyFocused;
        },
        isActive() {
            /* wwEditor:start */
            if (this.wwEditorState.isSelected) {
                return this.wwElementState.states.includes('active');
            }
            /* wwEditor:end */
            return this.isReallyActive;
        },
        isFocusVisible() {
            /* wwEditor:start */
            if (this.wwEditorState.isSelected) {
                return this.wwElementState.states.includes('focus-visible');
            }
            /* wwEditor:end */
            return this.isReallyFocusVisible;
        },
        buttonContentStyle() {
            return {
                columnGap: this.content?.columnGap || '0px',
            };
        },
    },
    watch: {
        'content.disabled': {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'disabled');
                } else {
                    this.$emit('remove-state', 'disabled');
                }
            },
        },
        'content.isLoading': {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'loading');
                } else {
                    this.$emit('remove-state', 'loading');
                }
            },
        },
        isReallyFocused(isFocused, wasFocused) {
            if (isFocused && !wasFocused) {
                this.$emit('trigger-event', { name: 'focus' });
            } else if (!isFocused && wasFocused) {
                this.$emit('trigger-event', { name: 'blur' });
            }
        },
        isFocused: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'focus');
                } else {
                    this.$emit('remove-state', 'focus');
                }
            },
        },
        isActive: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'active');
                } else {
                    this.$emit('remove-state', 'active');
                }
            },
        },
        isFocusVisible: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'focus-visible');
                } else {
                    this.$emit('remove-state', 'focus-visible');
                }
            },
        },
    },
    methods: {
        /* wwEditor:start */
        selectParentFormContainer() {
            const parentUid = wwLib.selectParentByFlag(this.$el, 'form-container');
            if (!parentUid) {
                wwLib.wwNotification.open({
                    text: {
                        en: 'No parent form container found. Please, add this submit button into a form container.',
                        fr: 'Aucun formulaire parent trouvé. Veuillez intégrer ce bouton submit dans un form container.',
                    },
                    color: 'yellow',
                    duration: 6000,
                });
            }
        },
        /* wwEditor:end */
        onFocus() {
            this.isReallyFocused = true;
            this.isReallyFocusVisible = !this._lastFocusByPointer;
            this._lastFocusByPointer = false;
        },
        onBlur() {
            this.isReallyFocused = false;
            this.isReallyFocusVisible = false;
        },
        onActivate(event) {
            this.isReallyActive = true;
            // Emit the original event name
            const eventName = event.type;
            this.$emit('trigger-event', { name: eventName, event });
        },
        onDeactivate(event) {
            this.isReallyActive = false;
            // Emit the original event name
            const eventName = event.type;
            this.$emit('trigger-event', { name: eventName, event });
        },
        onTouchActivate() {
            this._lastFocusByPointer = true;
            this.isReallyActive = true;
        },
        onTouchDeactivate() {
            this.isReallyActive = false;
        },
        onMouseActivate() {
            this._lastFocusByPointer = true;
            this.isReallyActive = true;
        },
        onMouseDeactivate() {
            this.isReallyActive = false;
        },
        onKeyActivate() {
            this.isReallyActive = true;
        },
        onKeyDeactivate() {
            this.isReallyActive = false;
        },
        onKeyDown(event) {
            this.$emit('trigger-event', { name: 'keydown', event });
        },
        onKeyUp(event) {
            this.$emit('trigger-event', { name: 'keyup', event });
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-button {
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &.button {
        outline: none;
        border: none;
        background: none;
        font-family: inherit;
        font-size: inherit;
    }

    &.-link {
        cursor: pointer;
    }
}

.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 0;
}
</style>
