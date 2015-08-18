# cloneReferencedElement for React Native

This is a version of `React.cloneElement` that preserves the original element's ref even if you specify a new ref for the clone.

## Usage

The signature of `cloneReferencedElement` is the same as that of `React.cloneElement`. However, when using callback refs, it will preserve the ref on the original component if there is one.

```js
let element =
  <Component ref={component => {
    console.log('Running the original ref handler');
  }} />
cloneReferencedElement(element, {
  ref(component) {
    console.log('Running the clone ref handler');
  },
});
```

When the component is mounted, the console will display:
```
Running the clone ref handler
Running the original ref handler
```
