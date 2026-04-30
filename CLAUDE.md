# CLAUDE.md - WeWeb Component Development Guide

This file provides comprehensive guidance for developing WeWeb custom components in this repository.

## Development Commands

- **Install dependencies**: `npm i`
- **Serve locally**: `npm run serve --port=[PORT]` (then add custom element in WeWeb editor developer popup)
- **Build for release**: `npm run build --name=my-element` (check for build errors before release)

## WeWeb Component Architecture

This is a WeWeb custom element component built with Vue.js and configured using the WeWeb CLI framework.

### Project Structure

- `src/wwElement.vue` - Main Vue component with template, script, and scoped SCSS styling
- `ww-config.js` - WeWeb element configuration defining editor properties and settings
- `package.json` - Contains WeWeb CLI dependency and build/serve scripts

### Component Architecture

- **Props**: Component receives `content` object prop containing all configurable properties
- **Configuration**: Element properties are defined in `ww-config.js` and accessed via `props.content.propertyName`
- **Styling**: Uses scoped SCSS with Vue single-file component structure
- **WeWeb Integration**: Element integrates with WeWeb editor through configuration schema

## CRITICAL REQUIREMENTS

**THESE ARE MANDATORY AND MUST BE FOLLOWED IN ALL WeWeb COMPONENTS:**

- **MANDATORY & CRITICAL**: Use optional chaining (?.) for all content references
- **MANDATORY & CRITICAL**: All variable references, content properties, computed values, functions and any accessed data must include type safety checks (using optional chaining, nullish coalescing, type guards etc.) to prevent component crashes when values are undefined/null or of incorrect type - especially for props.content references which may not exist initially
- **MANDATORY & CRITICAL**: Every content properties must be considered reactive, when the user change their value in the editor the component must update in realtime
- **MANDATORY**: INCLUDE ALL USEFUL TRIGGERS AND INTERNAL VARIABLES
- **CRITICAL** Always import any external functions/utilities you plan to use
    - If using date-fns functions like addDays, import them: `import { addDays } from 'date-fns'`
    - If using lodash functions, import them: `import { get } from 'lodash'`
    - If using custom utilities, import them from their correct path
- Add ANY triggers that could be useful for NoCode users
- Add ANY internal variables that could be useful for NoCode users
- Think from a NoCode user perspective when adding these

## ABSOLUTELY CRITICAL TECHNICAL REQUIREMENTS

### Editor Code Blocks (MANDATORY):

- `/* wwEditor:start */` and `/* wwEditor:end */` blocks MUST be present in BOTH component code AND ww-config.js
- Required for ALL bindingValidation and propertyHelp
- EVERY wwEditor:start MUST have matching wwEditor:end
- Mismatched tags will cause catastrophic component failure

### Global Object Access (MANDATORY):

- NEVER access document/window directly
- ALWAYS use wwLib.getFrontDocument() for document
- ALWAYS use wwLib.getFrontWindow() for window
- Direct access breaks component isolation

### Component Root Element Sizing (CRITICAL):

- NEVER hardcode width/height on the root element
- Root element MUST fluidly adapt to user-defined dimensions
- Fixed dimensions on root element prevent proper NoCode customization
- Inner elements may have fixed dimensions as needed

### Array Property Requirements (ABSOLUTELY CRITICAL):

- **ALL Array properties containing objects MUST follow the WeWeb professional standard**
- **MANDATORY Array Structure in ww-config.js:**

    ```javascript
    arrayProperty: {
      label: { en: 'Items' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        { id: 'item1', name: 'Sample Item', value: 'data' }
      ],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item.name || item.label || item.title || `Item ${item.id || 'Unknown'}`;
        },
        item: {
          type: 'Object',
          defaultValue: { id: 'item1', name: 'New Item', value: '' },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Text' },
              name: { label: { en: 'Name' }, type: 'Text' },
              value: { label: { en: 'Value' }, type: 'Text' }
            }
          }
        }
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of objects with required properties'
      },
      /* wwEditor:end */
    }
    ```

- **MANDATORY Formula Properties for Dynamic Field Mapping:**

    ```javascript
    // For each important field in your array items, create a formula property
    arrayPropertyIdFormula: {
      label: { en: 'ID Field' },
      type: 'Formula',
      section: 'settings',
      options: content => ({
        template: Array.isArray(content.arrayProperty) && content.arrayProperty.length > 0 ? content.arrayProperty[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['id']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.arrayProperty) || !content.arrayProperty?.length || !boundProps.arrayProperty,
    },
    arrayPropertyNameFormula: {
      label: { en: 'Name Field' },
      type: 'Formula',
      section: 'settings',
      options: content => ({
        template: Array.isArray(content.arrayProperty) && content.arrayProperty.length > 0 ? content.arrayProperty[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['name']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.arrayProperty) || !content.arrayProperty?.length || !boundProps.arrayProperty,
    }
    ```

- **MANDATORY Vue Component Processing Pattern:**

    ```javascript
    const processedItems = computed(() => {
        const items = props.content?.arrayProperty || [];
        const { resolveMappingFormula } = wwLib.wwFormula.useFormula();

        return items.map(item => {
            // Use formula mapping for dynamic field resolution
            const id = resolveMappingFormula(props.content?.arrayPropertyIdFormula, item) ?? item.id;
            const name = resolveMappingFormula(props.content?.arrayPropertyNameFormula, item) ?? item.name;

            return {
                id: id || `item-${Date.now()}-${Math.random()}`,
                name: name || 'Untitled',
                // Include original data for reference
                originalItem: item,
                ...item,
            };
        });
    });
    ```

- **Legacy ObjectPropertyPath Support (keep for backward compatibility):**

    ```javascript
    arrayPropertyDisplayPropertyPath: {
      label: { en: 'Display Property' },
      type: 'ObjectPropertyPath',
      section: 'settings',
      hidden: (content) => !content?.arrayProperty?.length,
      defaultValue: 'name',
      bindable: true
    }
    ```

- **Why This Pattern is Critical:**
    - ✅ **Professional UX**: Shows meaningful labels like "John's Event" instead of "Object"
    - ✅ **Dynamic Data Binding**: Users can bind external APIs and map fields visually
    - ✅ **NoCode Flexibility**: Non-technical users can connect any data structure
    - ✅ **Field Mapping UI**: WeWeb automatically shows formula editors for bound arrays
    - ✅ **Real-time Updates**: Changes reflect immediately without component re-render
    - ✅ **Industry Standard**: Matches WeWeb's built-in components (FullCalendar, etc.)

- **When to Use Formula Mapping:**
    - **ALWAYS** for components that accept arrays of objects (events, items, nodes, records, etc.)
    - **ALWAYS** when users need to bind external data sources (APIs, databases)
    - **ALWAYS** for professional-grade components that will be used by NoCode users
    - **EXAMPLES**: Calendar events, chart data, list items, table rows, flow nodes/edges, gallery images

- **Implementation Checklist:**
    1. ✅ Array property with `options.expandable: true`
    2. ✅ Meaningful `getItemLabel()` function
    3. ✅ Complete `options.item` structure with all fields
    4. ✅ Formula properties for each mappable field
    5. ✅ `resolveMappingFormula()` processing in Vue component
    6. ✅ `hidden` conditions on formula properties
    7. ✅ Backward compatibility with direct property access

### Select/Input Components (MANDATORY):

- MUST HAVE an initialValue property to bind the initial value
- MUST EXPOSE an internal variable using `wwLib.wwVariable.useComponentVariable`
- Value can be updated through user interaction
- When initialValue changes, reset the internal variable
- When value changes, emit trigger event (AVOID INFINITE LOOPS)

### Component Reactivity (ABSOLUTELY CRITICAL):

- **ALL props.content properties MUST be fully reactive** - changes must reflect immediately without re-render
- NEVER use ref() or reactive() for data derived from props - use computed() instead
- NEVER use manual watchers for prop changes - computed properties handle this automatically
- NEVER use initialization functions that set ref values from props - this breaks reactivity

#### MANDATORY: Complete Property Watching for Components that Need Reinitialization

**ALL properties that affect component rendering MUST be watched:**

```javascript
// ❌ INCOMPLETE - Only watches some props (breaks user experience)
watch(
    () => [props.content?.theme],
    () => reinitialize()
);

// ✅ COMPLETE - Watches ALL relevant props (professional UX)
watch(
    () => [
        props.content?.theme,
        props.content?.size, // Include ALL props that affect rendering
        props.content?.position, // Even seemingly minor ones
        props.content?.showFeature, // Boolean toggles
        props.content?.perLine, // Number inputs like "per line", "rows"
        props.content?.layout, // Layout options
        props.content?.customData, // Arrays and objects
        props.content?.locale, // Any prop that changes component behavior
        // ... EVERY prop that should trigger visual updates
    ],
    () => {
        // Small delay for stability, then reinitialize
        setTimeout(() => {
            if (containerRef.value) {
                reinitializeComponent();
            }
        }, 50);
    },
    { deep: true }
);
```

**Why this matters:** WeWeb users expect INSTANT visual updates when changing properties in the editor. Missing props in watchers = broken UX.

#### Basic Reactivity Patterns:

- **Pattern to follow:**

    ```javascript
    // ❌ WRONG - Breaks reactivity
    const internalData = ref([]);
    const initializeData = () => {
        internalData.value = props.content?.data || [];
    };
    watch(() => props.content?.data, initializeData);

    // ✅ CORRECT - Fully reactive
    const internalData = computed(() => {
        return props.content?.data || [];
    });
    ```

- **For complex processing of props:**
    ```javascript
    // ✅ CORRECT - Process props reactively
    const processedData = computed(() => {
        const rawData = props.content?.data || [];
        return rawData.map(item => ({
            ...item,
            processed: true,
            color: props.content?.defaultColor || '#000',
        }));
    });
    ```
- **Internal variables should track computed data:**
    ```javascript
    // ✅ CORRECT - Reactive variable updates
    watch(
        processedData,
        newData => {
            setInternalVariable(newData.length);
        },
        { immediate: true }
    );
    ```

### Build Configuration (ABSOLUTELY CRITICAL):

- NO build configuration files allowed: webpack.config.js, vite.config.js, rollup.config.js, etc.
- NO compiler configs: .babelrc, babel.config.js, tsconfig.json, etc.
- NO build dependencies in package.json: webpack, vite, babel, loaders, preprocessors, etc.
- Build process handled entirely by @weweb/cli
- Only include @weweb/cli as devDependency with "latest" version

### Package.json Requirements (CRITICAL):

- Name MUST NOT include "ww" or "weweb"
- Use specific versions for production dependencies (NOT "latest")
- Keep dependencies minimal and focused
- Always include proper scripts: build and serve

## WeWeb Development Patterns & Best Practices

### 1. Component Props Structure

```javascript
// Always use this exact prop structure in wwElement.vue
export default {
    props: {
        uid: { type: String, required: true },
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
};
```

### 2. Editor State Management

```javascript
// Use wwEditor blocks to handle editor-specific code
setup(props, { emit }) {
  /* wwEditor:start */
  const isEditing = computed(() => {
    return props.wwEditorState.isEditing;
  });
  /* wwEditor:end */

  // Production code continues here...
}
```

### 3. Property Access Pattern

```javascript
// Always use optional chaining for content properties
const computedStyle = computed(() => ({
    width: props.content?.width || '100%',
    height: props.content?.height || '400px',
    backgroundColor: props.content?.backgroundColor || '#000000',
}));
```

### 4. Internal Variables Pattern (MANDATORY for Interactive Components)

```javascript
// MANDATORY: Define internal variables for NoCode users
const { value: internalValue, setValue: setInternalValue } = wwLib.wwVariable.useComponentVariable({
    uid: props.uid, // Always use props.uid for unique instances
    name: 'value',
    type: 'string',
    defaultValue: 'my internal variable',
});

// MANDATORY: Watch for initialValue changes and reset internal variable
watch(
    () => props.content?.initialValue,
    newValue => {
        if (newValue !== undefined) {
            setInternalValue(newValue);
        }
    },
    { immediate: true }
);

// MANDATORY: Emit trigger events when value changes
const handleValueChange = newValue => {
    if (internalValue.value !== newValue) {
        setInternalValue(newValue);
        emit('trigger-event', {
            name: 'value-change',
            event: { value: newValue },
        });
    }
};
```

### 5. Array with ObjectPropertyPath Pattern

```javascript
// MANDATORY: For Array properties containing objects
const displayItems = computed(() => {
    const items = props.content?.items || [];
    const displayPath = props.content?.displayPropertyPath;

    return items.map(item => ({
        ...item,
        displayValue: wwLib.wwUtils.resolveObjectPropertyPath(item, displayPath || 'name'),
    }));
});
```

### 4. Configuration Schema (ww-config.js)

#### Basic Structure:

```javascript
export default {
    editor: {
        label: 'Component Name',
        icon: 'icon-name',
    },
    properties: {
        // Property definitions here
    },
    triggerEvents: [
        // Event definitions here
    ],
};
```

#### Property Types & Examples:

##### Text/String Properties:

```javascript
myText: {
  label: 'Text Content',
  type: 'Text',
  bindable: true,
  defaultValue: 'Default text'
}
```

##### Color Properties:

```javascript
backgroundColor: {
  label: 'Background Color',
  type: 'Color',
  defaultValue: '#ffffff',
  bindable: true
}
```

##### CRITICAL: TextSelect Properties (MANDATORY FORMAT):

**MUST use nested options structure or dropdowns will not work:**

```javascript
// ❌ WRONG - Will not show dropdown options:
mySelect: {
  type: 'TextSelect',
  options: {
    value1: 'Label 1',
    value2: 'Label 2'
  }
}

// ✅ CORRECT - Required WeWeb format:
mySelect: {
  label: { en: 'Select Option' },
  type: 'TextSelect',
  section: 'settings',
  options: {
    options: [
      { value: 'value1', label: 'Label 1' },
      { value: 'value2', label: 'Label 2' },
      { value: 'value3', label: 'Label 3' }
    ]
  },
  defaultValue: 'value1',
  bindable: true,
  /* wwEditor:start */
  bindingValidation: {
    type: 'string',
    tooltip: 'Valid values: value1 | value2 | value3'
  },
  /* wwEditor:end */
}
```

##### Number Properties:

```javascript
animationSpeed: {
  label: 'Animation Speed',
  type: 'Number',
  min: 0.1,
  max: 5,
  step: 0.1,
  defaultValue: 1,
  bindable: true
}
```

##### Boolean Properties:

```javascript
showLabels: {
  label: 'Show Labels',
  type: 'OnOff',
  defaultValue: true,
  bindable: true
}
```

##### Select/Dropdown Properties:

```javascript
colorScheme: {
  label: 'Color Scheme',
  type: 'TextSelect',
  options: {
    realistic: 'Realistic',
    vibrant: 'Vibrant',
    neon: 'Neon',
    classic: 'Classic'
  },
  defaultValue: 'realistic',
  bindable: true
}
```

##### Range/Slider Properties:

```javascript
intensity: {
  label: 'Glow Intensity',
  type: 'Length',
  min: 0,
  max: 10,
  step: 1,
  defaultValue: 5,
  bindable: true
}
```

##### Spacing Properties (with Unit Choices):

**Use for dimensions that need multiple unit options (px, %, em, etc.) with responsive/state support:**

```javascript
borderRadius: {
  type: 'Spacing',
  label: { en: 'Border Radius' },
  section: 'style',
  options: {
    unitChoices: [
      { value: 'px', label: 'px', min: 0, max: 500 },
      { value: '%', label: '%', min: 0, max: 100 },
    ],
    isCorner: true,    // For corner radius inputs (shows 4-corner control)
    noRange: true,     // Disable range slider (use number input only)
    useVar: true,      // Allow CSS variable usage
  },
  bindable: true,
  responsive: true,    // Enable per-breakpoint values
  states: true,        // Enable per-state values (hover, focus, etc.)
  classes: true,       // Enable class-based styling
  defaultValue: '4px',
  /* wwEditor:start */
  bindingValidation: {
    type: 'string',
    tooltip: 'CSS spacing value with unit (e.g., "8px", "50%")'
  },
  propertyHelp: {
    tooltip: 'Border radius with support for px or % units.'
  },
  /* wwEditor:end */
}
```

**Spacing Options Reference:**

- `unitChoices`: Array of `{ value, label, min, max }` for each allowed unit
- `isCorner`: `true` for corner radius (4-value control), `false` for single value
- `noRange`: `true` to show only number input, `false` to include range slider
- `useVar`: `true` to allow CSS variable references

**Common Use Cases:**

```javascript
// Gap/Spacing
gap: {
  type: 'Spacing',
  label: { en: 'Gap' },
  options: {
    unitChoices: [
      { value: 'px', label: 'px', min: 0, max: 200 },
      { value: 'rem', label: 'rem', min: 0, max: 10 },
    ],
    noRange: true,
    useVar: true,
  },
  defaultValue: '16px',
  responsive: true,
}

// Width/Height with percentage support
columnWidth: {
  type: 'Spacing',
  label: { en: 'Column Width' },
  options: {
    unitChoices: [
      { value: 'px', label: 'px', min: 50, max: 1000 },
      { value: '%', label: '%', min: 10, max: 100 },
      { value: 'vw', label: 'vw', min: 10, max: 100 },
    ],
    noRange: true,
    useVar: true,
  },
  defaultValue: '300px',
  responsive: true,
}
```

### 5. Property Organization & Sections

```javascript
properties: {
  // Group related properties with consistent naming
  animationSpeed: { /* ... */ },
  animationEnabled: { /* ... */ },

  // Visual properties
  colorScheme: { /* ... */ },
  backgroundColor: { /* ... */ },

  // Content properties
  showLabels: { /* ... */ },
  labelColor: { /* ... */ }
}
```

### 6. Event Handling & Triggers

```javascript
// In ww-config.js - Define available events
triggerEvents: [
    { name: 'click', label: 'On click', event: { value: '' } },
    { name: 'planet-select', label: 'Planet selected', event: { planet: '' } },
];

// In Vue component - Emit events
const handleClick = data => {
    emit('trigger-event', {
        name: 'click',
        event: { value: data },
    });
};
```

### 7. Styling Best Practices

#### CSS Variables for Dynamic Styling:

```vue
<template>
    <div class="solar-system" :style="dynamicStyles">
        <!-- content -->
    </div>
</template>

<script>
const dynamicStyles = computed(() => ({
    '--animation-speed': props.content?.animationSpeed || 1,
    '--primary-color': props.content?.primaryColor || '#ffffff',
    '--size-scale': props.content?.sizeScale || 1,
}));
</script>

<style scoped>
.solar-system {
    animation-duration: calc(10s / var(--animation-speed));
    color: var(--primary-color);
    transform: scale(var(--size-scale));
}
</style>
```

#### Responsive Design:

```scss
.component {
    // Mobile first
    width: 100%;
    height: 300px;

    // Tablet
    @media (min-width: 768px) {
        height: 400px;
    }

    // Desktop
    @media (min-width: 1024px) {
        height: 500px;
    }
}
```

### 8. Vue 3 Composition API Patterns

#### Setup Function Structure:

```javascript
setup(props, { emit }) {
  // Editor state
  /* wwEditor:start */
  const isEditing = computed(() => props.wwEditorState.isEditing);
  /* wwEditor:end */

  // Reactive data
  const localState = ref(false);

  // Computed properties
  const computedValue = computed(() => {
    return props.content?.someValue || 'default';
  });

  // Lifecycle hooks
  onMounted(() => {
    // Initialize component
  });

  // Methods
  const handleInteraction = () => {
    emit('trigger-event', { name: 'interaction' });
  };

  // Return what template needs
  return {
    computedValue,
    handleInteraction,
    /* wwEditor:start */
    isEditing,
    /* wwEditor:end */
  };
}
```

### 9. Animation & Performance

#### CSS Animations:

```scss
@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animated-element {
    animation: rotate calc(10s / var(--speed)) linear infinite;
    will-change: transform; // Optimize for animations
}
```

#### Performance Considerations:

- Use `transform` and `opacity` for animations (GPU accelerated)
- Add `will-change` property for animated elements
- Use `v-show` instead of `v-if` for frequently toggled elements
- Implement proper cleanup in lifecycle hooks

### 10. Error Handling & Validation

#### Safe Property Access:

```javascript
// Always use optional chaining and defaults
const safeValue = computed(() => {
    const value = props.content?.complexProperty?.nestedValue;
    return Array.isArray(value) ? value : [];
});
```

#### Validation in ww-config.js:

```javascript
myProperty: {
  label: 'My Property',
  type: 'Number',
  min: 1,
  max: 100,
  step: 1,
  defaultValue: 50,
  bindingValidation: {
    type: 'number',
    required: false
  },
  propertyHelp: 'This property controls the intensity of the effect'
}
```

### 11. Testing & Debugging

#### Common Issues:

- **Undefined properties**: Always use optional chaining `props.content?.property`
- **Animation performance**: Use CSS transforms instead of changing layout properties
- **Editor state**: Ensure `wwEditor` blocks are properly structured
- **Event emission**: Verify event names match `triggerEvents` in config

### 12. WeWeb Component Standards Reference

#### Complete TextSelect Pattern (Copy-Paste Ready)

```javascript
propertyName: {
  label: { en: 'Display Name' },
  type: 'TextSelect',
  section: 'settings',
  options: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ]
  },
  defaultValue: 'option1',
  bindable: true,
  /* wwEditor:start */
  bindingValidation: {
    type: 'string',
    tooltip: 'Valid values: option1 | option2 | option3'
  },
  /* wwEditor:end */
}
```

#### Complete Reactivity Pattern (Copy-Paste Ready)

```javascript
// Watch ALL properties that affect component state - ADD EVERY RELEVANT PROP
watch(
    () => [
        props.content?.theme,
        props.content?.size,
        props.content?.layout,
        props.content?.showFeature,
        props.content?.perLine,
        props.content?.maxRows,
        props.content?.customData,
        props.content?.locale,
        props.content?.categories,
        // IMPORTANT: List EVERY prop that should trigger visual updates
        // Missing props = broken user experience
    ],
    () => {
        // Small delay for stability, then reinitialize
        setTimeout(() => {
            if (containerRef.value) {
                reinitializeComponent();
            }
        }, 50);
    },
    { deep: true }
);

// Separate watcher for style-only changes (optional)
watch(
    () => [
        props.content?.width,
        props.content?.height,
        props.content?.backgroundColor,
        props.content?.borderRadius,
        // Style props handled by computed CSS variables
    ],
    () => {
        // No action needed - handled by computedStyle
    },
    { deep: true }
);
```

#### Complete Internal Variable Pattern

```javascript
// MANDATORY for interactive components
const { value: internalValue, setValue: setInternalValue } = wwLib.wwVariable.useComponentVariable({
    uid: props.uid, // Always use props.uid
    name: 'value',
    type: 'string',
    defaultValue: 'default value',
});

// Watch for initialValue changes
watch(
    () => props.content?.initialValue,
    newValue => {
        if (newValue !== undefined) {
            setInternalValue(newValue);
        }
    },
    { immediate: true }
);

// Emit trigger on value change
const handleValueChange = newValue => {
    if (internalValue.value !== newValue) {
        setInternalValue(newValue);
        emit('trigger-event', {
            name: 'value-change',
            event: { value: newValue },
        });
    }
};
```

### Dropzone Implementation (PROFESSIONAL STANDARD)

**Dropzones allow users to drag and drop any WeWeb elements into your component, creating flexible and interactive UIs.**

#### MANDATORY: Dropzone Configuration Pattern

**Step 1: Add Hidden Array Property in ww-config.js**

```javascript
properties: {
  // Dropzone property - MUST be hidden array
  dropzoneContent: {
    hidden: true,
    defaultValue: [],
    /* wwEditor:start */
    bindingValidation: {
      type: 'array',
      tooltip: 'Array of elements to display in dropzone'
    },
    /* wwEditor:end */
  },

  // Optional: Toggle to show/hide dropzone
  showDropzone: {
    label: { en: 'Show Dropzone' },
    type: 'OnOff',
    section: 'settings',
    defaultValue: true,
    bindable: true,
    /* wwEditor:start */
    bindingValidation: {
      type: 'boolean',
      tooltip: 'Show/hide the dropzone area'
    },
    propertyHelp: 'Toggle the dropzone where users can drop elements'
    /* wwEditor:end */
  },

  // Dropzone styling options
  dropzoneHeight: {
    label: { en: 'Dropzone Height' },
    type: 'Length',
    section: 'style',
    defaultValue: '80px',
    bindable: true,
    hidden: content => !content?.showDropzone,
  },

  dropzoneBackground: {
    label: { en: 'Dropzone Background' },
    type: 'Color',
    section: 'style',
    defaultValue: '#f9f9f9',
    bindable: true,
    hidden: content => !content?.showDropzone,
  },
}
```

**Step 2: Implement wwLayout in Vue Template**

```vue
<template>
    <div class="component-wrapper">
        <!-- Main component content -->
        <div class="main-content">
            <!-- Your component's primary functionality -->
        </div>

        <!-- Dropzone Area -->
        <div v-if="content?.showDropzone" class="dropzone-area" :style="dropzoneStyle">
            <!-- Optional: Show contextual info -->
            <div class="dropzone-info" v-if="someCondition">
                <span class="info-display">{{ someData }}</span>
            </div>

            <!-- CRITICAL: wwLayout component for dropzone -->
            <wwLayout path="dropzoneContent" direction="row" class="dropzone-container" />
        </div>
    </div>
</template>
```

**Step 3: Add Computed Styles and Watchers**

```javascript
// Computed styles for dropzone
const dropzoneStyle = computed(() => ({
    '--dropzone-height': props.content?.dropzoneHeight || '80px',
    '--dropzone-background': props.content?.dropzoneBackground || '#f9f9f9',
    '--dropzone-border': props.content?.showBorder ? `1px solid ${props.content?.borderColor}` : 'none',
}));

// Include dropzone properties in style watcher
watch(
    () => [
        // ... other properties
        props.content?.showDropzone,
        props.content?.dropzoneHeight,
        props.content?.dropzoneBackground,
    ],
    () => {
        // Style changes handled automatically via computed styles
    },
    { deep: true }
);
```

**Step 4: Professional Dropzone Styling**

```scss
.dropzone-area {
    height: var(--dropzone-height);
    background: var(--dropzone-background);
    border: var(--dropzone-border);
    border-top: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    gap: 16px;
}

.dropzone-container {
    flex: 1;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #d0d0d0;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
    position: relative;
}

/* Placeholder text when empty */
.dropzone-container:empty::after {
    content: 'Drop content here';
    color: #999;
    font-size: 14px;
    font-style: italic;
    text-align: center;
    pointer-events: none;
}

/* wwEditor:start */
.dropzone-container:hover {
    border-color: #007aff;
    background: rgba(0, 122, 255, 0.05);
}
/* wwEditor:end */

/* When dropzone has content */
.dropzone-container:not(:empty) {
    border-style: solid;
    border-color: transparent;
    background: transparent;
    justify-content: flex-start;
    padding: 8px;
}

.dropzone-container:not(:empty)::after {
    display: none;
}

/* Responsive design */
@media (max-width: 768px) {
    .dropzone-area {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
    }

    .dropzone-container {
        width: 100%;
    }
}
```

#### CRITICAL Requirements for Dropzones:

1. **Hidden Array Property**: MUST be `hidden: true` with `defaultValue: []`
2. **wwLayout Component**: MUST use `<wwLayout path="propertyName" />`
3. **Direction Attribute**: Use `direction="row"` or `direction="column"`
4. **Minimum Dimensions**: Dropzone MUST have min-width and min-height for usability
5. **Visual Feedback**: Dashed border and hover effects for better UX

#### Common Dropzone Use Cases:

**Content Areas:**

```javascript
// For flexible content sections
contentDropzone: {
  hidden: true,
  defaultValue: [],
  // Users can drop text, images, buttons, etc.
}
```

**Action Areas:**

```javascript
// For buttons and interactive elements
actionsDropzone: {
  hidden: true,
  defaultValue: [],
  // Users can drop buttons, links, forms, etc.
}
```

**Contextual Content:**

```javascript
// Content that appears based on component state
selectedItemContent: {
  hidden: true,
  defaultValue: [],
  // Content shown when item is selected/active
}
```

#### Advanced: Bindable Dropzones

```javascript
// For repeatable content with data binding
dropzoneItems: {
  hidden: true,
  bindable: 'repeatable', // SPECIAL: Makes it repeat with bound data
  defaultValue: []
}
```

When `bindable: 'repeatable'` is used, wwLayout will repeat its content for each item in bound collections, setting binding context for each item.

#### Professional Examples:

1. **Card Builder**: Main content + action buttons dropzone
2. **Dashboard Widget**: Data display + configuration controls dropzone
3. **Form Builder**: Form fields + submit actions dropzone
4. **Content Showcase**: Featured content + related items dropzone
5. **Interactive Timeline**: Event content + additional details dropzone

### 13. WeWeb-Specific Considerations

#### Bindable Properties:

- Set `bindable: true` for properties that should accept dynamic data
- Use appropriate `bindingValidation` for type checking

#### Editor Integration:

- Use descriptive labels and help text
- Group related properties logically
- Provide sensible default values
- Consider the editor user experience

#### Production Optimization:

- WeWeb strips `wwEditor` blocks in production builds
- Ensure component works without editor state
- Test both editor and production modes

### 14. Local Variables (LOCAL Context) - Professional WeWeb Pattern

**Local variables expose component data to the WeWeb formula editor under `context.local.data['component-name']`, allowing NoCode users to access and use component state in bindings and workflows.**

#### What Are Local Variables?

Local variables are reactive data exposed by your component that:

- **Appear in the formula editor** under `context.local.data['your-component-name']`
- **Update in real-time** as the component state changes
- **Can be used in workflows**, bindings, and other components
- **Provide rich component information** beyond just the internal variable

#### When to Use Local Variables

**ALWAYS implement local variables when:**

- Your component has **multiple pieces of state** users might need (options, selection details, UI state)
- Your component is **complex** with nested data structures (dropdowns, modals, tabs, sliders)
- You want to provide **computed/derived data** to users (filtered options, current slide info)
- Your component has **utility information** (isOpen, current index, dimensions)

**Examples of components that MUST have local variables:**

- **Select/Dropdown**: Options list, selected item details, search state, dropdown state
- **Tabs**: Active tab, all tabs list, tab methods
- **Slider**: Current slide index, total slides, navigation state
- **Modal/Dialog**: Open state, content data
- **Form**: Field values, validation state, submission status

#### Complete Implementation Pattern (Copy-Paste Ready)

```javascript
// In wwElement.vue setup()

// 1. MANDATORY: Track local context state
const currentLocalContext = ref({});

// 2. Define local data (computed or ref)
const localData = computed(() => ({
    // Computed values that update reactively
    options: options.value?.map(({ optionId, ...option }) => option) || [],

    // Current selection with details
    active: {
        value: variableValue,
        details: selectionDetails, // Computed property with full info
    },

    // Utility information
    utils: {
        type: selectType,
        isOpen: isOpen,
        triggerWidth: triggerWidth,
        triggerHeight: triggerHeight,
    },

    // Optional: Search state (if applicable)
    ...(hasSearch.value
        ? {
              search: {
                  value: computed(() => searchState.value?.value || ''),
                  searchBy: computed(() => searchState.value?.searchBy || []),
                  searchMatches: computed(() => searchState.value?.searchMatches || []),
              },
          }
        : {}),
}));

// 3. OPTIONAL: Define methods for NoCode users
const localMethods = {
    methodName: {
        description: 'What this method does',
        method: yourMethodFunction,
        editor: {
            label: 'Action Label',
            group: 'Component Group',
            icon: 'icon-name',
        },
    },
};

// 4. MANDATORY: Add markdown documentation
const markdown = `### Component Local Information

#### propertyName
Description of what this property contains and how to use it.
- \`subProperty\`: What this contains
- \`anotherProperty\`: Its purpose

#### anotherProperty
More details about available data...

**Usage Example:**
\`\`\`
context.local.data?.['component-name']?.['propertyName']?.['subProperty']
\`\`\`
`;

// 5. MANDATORY: Register the local context
wwLib.wwElement.useRegisterElementLocalContext(
    'component-name', // CRITICAL: This becomes context.local.data['component-name']
    localData.value, // Use .value for computed, or ref directly
    localMethods, // Optional: {} if no methods
    markdown // Optional: undefined if no docs (but HIGHLY RECOMMENDED)
);

// 6. OPTIONAL: Provide for child components (if needed)
provide('_wwComponentName:localContext', currentLocalContext);

// 7. OPTIONAL: Dynamic context updates (advanced pattern)
const registerLocalContext =
    key =>
    ({ data, markdown }) => {
        const currentContext = currentLocalContext.value;
        const newLocalContext = {
            data: {
                ...currentContext.data,
                [key]: data,
            },
            methods: {},
            markdown: {
                ...currentContext.markdown,
                [key]: markdown,
            },
        };

        wwLib.wwElement.useRegisterElementLocalContext(
            'component-name',
            newLocalContext.data,
            newLocalContext.methods,
            newLocalContext.markdown
        );

        currentLocalContext.value = newLocalContext;
    };
```

#### Real-World Example: Select Component

```javascript
// From ww-input-select implementation

const currentLocalContext = ref({});

// Computed data with full selection details
const selectionDetails = computed(() => {
    const dataArray = Array.isArray(rawData.value) ? rawData.value : [];
    const _optionsMap = new Map(
        dataArray.map(option => {
            const mappedValue = resolveMappingFormula(mappingValue.value, option) ?? option.value;
            return [mappedValue, option];
        })
    );

    const formatOption = opt => ({
        value: resolveMappingFormula(mappingValue.value, opt) ?? opt.value,
        label: resolveMappingFormula(mappingLabel.value, opt) ?? opt.label,
        icon: resolveMappingFormula(mappingIcon.value, opt) ?? opt.icon,
        disabled: opt.disabled || false,
        data: opt || {},
    });

    if (selectType.value === 'single') {
        const option = _optionsMap.get(variableValue.value);
        return option ? formatOption(option) : null;
    } else {
        const selectedValues = Array.isArray(variableValue.value) ? variableValue.value : [];
        return selectedValues.map(value => {
            const option = _optionsMap.get(value);
            return option ? formatOption(option) : { value, label: value, isInOptions: false };
        });
    }
});

const _options = computed(() => options.value?.map(({ optionId, ...option }) => option) || []);

const data = ref({
    options: _options,
    active: {
        value: variableValue,
        details: selectionDetails,
    },
    utils: {
        type: selectType,
        isOpen,
        triggerWidth,
        triggerHeight,
    },
});

// Watch for dynamic search addition
watch(
    hasSearch,
    newHasSearch => {
        if (newHasSearch) {
            data.value.search = {
                value: computed(() => searchState.value?.value || ''),
                searchBy: computed(() => searchState.value?.searchBy || []),
                searchMatches: computed(() => searchState.value?.searchMatches || []),
            };
        } else {
            delete data.value.search;
        }
    },
    { immediate: true }
);

const markdown = `### Select local informations

#### options
Array of all available options in the dropdown. Each option contains:
- \`value\`: Option's value
- \`label\`: Display text
- \`disabled\`: Boolean indicating if option is disabled
- \`isSelected\`: Boolean indicating if option is selected
- \`data\`: Data from the repeat context (optional)

#### active
Information about currently selected option(s):
- \`value\`: Current selection (single value or array for multiple select)
- \`details\`: Detailed information about selected option(s)

#### utils
Component state information:
- \`type\`: Select type ('single' or 'multiple')
- \`isOpen\`: Boolean indicating if dropdown is open
- \`triggerWidth\`: Width of trigger element
- \`triggerHeight\`: Height of trigger element

#### search (optional)
Present when search is enabled:
- \`value\`: Current search input value
- \`searchBy\`: Fields to search by
- \`searchMatches\`: Options matching search criteria`;

// Register with multi-part context (advanced)
const registerLocalContext =
    key =>
    ({ data, markdown }) => {
        const selectLocalContext = currentLocalContext.value;
        const newLocalContext = {
            data: {
                ...selectLocalContext.data,
                [key]: data,
            },
            methods: {},
            markdown: {
                ...selectLocalContext.markdown,
                [key]: markdown,
            },
        };

        wwLib.wwElement.useRegisterElementLocalContext(
            'select',
            newLocalContext.data,
            newLocalContext.methods,
            newLocalContext.markdown
        );

        currentLocalContext.value = newLocalContext;
    };

const registerSelectLocalContext = registerLocalContext('select');
registerSelectLocalContext({ data, markdown });
```

#### Access Pattern in Formula Editor

**Users access your local variables like this:**

```javascript
// Basic access
context.local.data?.['component-name'];

// Specific property
context.local.data?.['select']?.['active']?.['value'];

// Full detail object
context.local.data?.['select']?.['active']?.['details']?.['label'];

// Utility info
context.local.data?.['select']?.['utils']?.['isOpen'];

// Array of options
context.local.data?.['select']?.['options'];
```

#### Critical Requirements

1. **Component Name MUST be unique and descriptive**
    - ✅ `'select'`, `'slider'`, `'dialog'`, `'tabs'`
    - ❌ `'component'`, `'element'`, `'main'`

2. **Data MUST be reactive (computed or ref)**
    - Use `computed()` for derived data
    - Use `ref()` for direct state
    - Pass `.value` to the registration function

3. **Always use optional chaining in access examples**

    ```javascript
    // ✅ CORRECT
    context.local.data?.['component']?.['property'];

    // ❌ WRONG
    context.local.data['component']['property'];
    ```

4. **Markdown documentation is HIGHLY RECOMMENDED**
    - Appears as tooltip in formula editor
    - Helps users understand available properties
    - Provides usage examples

#### Common Local Variable Patterns

**Pattern 1: Simple State Exposure**

```javascript
const localData = ref({
    isOpen: isOpen.value,
    currentIndex: currentIndex.value,
});

wwLib.wwElement.useRegisterElementLocalContext('component', localData.value, {});
```

**Pattern 2: Computed with Details**

```javascript
const localData = computed(() => ({
    value: internalValue.value,
    details: {
        formatted: formatValue(internalValue.value),
        isValid: validateValue(internalValue.value),
        metadata: getMetadata(internalValue.value),
    },
}));

wwLib.wwElement.useRegisterElementLocalContext('component', localData.value, {});
```

**Pattern 3: Dynamic Properties**

```javascript
const localData = computed(() => {
    const base = {
        items: items.value,
        selectedItem: selectedItem.value,
    };

    if (showAdvanced.value) {
        base.advanced = {
            filters: filters.value,
            sorting: sorting.value,
        };
    }

    return base;
});
```

**Pattern 4: With Methods**

```javascript
const localMethods = {
    selectItem: {
        description: 'Select an item by value',
        method: value => selectItem(value),
        editor: {
            label: 'Select Item',
            group: 'Selection',
            icon: 'cursor-click',
        },
    },
    clearSelection: {
        description: 'Clear current selection',
        method: () => clearSelection(),
        editor: {
            label: 'Clear',
            group: 'Selection',
            icon: 'x',
        },
    },
};

wwLib.wwElement.useRegisterElementLocalContext('component', localData.value, localMethods, markdown);
```

#### Testing Your Local Variables

**In the WeWeb editor, users can test local variables:**

1. **Formula Explorer**: Check `context.local.data` → see your component
2. **Binding Panel**: Type `context.local.data['your-component']` to see autocomplete
3. **Console**: `wwLib.getComponentLocalContext()` to inspect all contexts

#### Integration with Internal Variables

**Local variables complement (don't replace) internal variables:**

```javascript
// Internal variable: Simple state storage
const { value: internalValue, setValue } = wwLib.wwVariable.useComponentVariable({
    uid: props.uid,
    name: 'value',
    type: 'string',
    defaultValue: 'default',
});

// Local variable: Rich context with details
const localData = computed(() => ({
    value: internalValue.value, // Same as internal variable
    details: {
        // Additional computed info
        formatted: formatValue(internalValue.value),
        isValid: validateValue(internalValue.value),
    },
    options: options.value,
    utils: { isOpen: isOpen.value },
}));

wwLib.wwElement.useRegisterElementLocalContext('component', localData.value, {});
```

**When to use which:**

- **Internal Variable**: Simple value storage, form integration, workflow variable access
- **Local Variable**: Rich component data, computed info, multiple related properties
