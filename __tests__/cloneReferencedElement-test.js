const React = require('react');
const TestRenderer = require('react-test-renderer');

const cloneReferencedElement = require('../cloneReferencedElement');

class TestComponent extends React.Component {
  render() {
    return null;
  }
}

test(`clones an element that uses both the original and cloned elements' callback refs`, () => {
  const originalElementRef = jest.fn();
  const clonedElementRef = jest.fn();

  const originalElement = React.createElement(TestComponent, {
    ref: originalElementRef,
    id: 'original',
  });
  const clonedElement = cloneReferencedElement(originalElement, {
    ref: clonedElementRef,
    id: 'clone',
  });

  const testRenderer = TestRenderer.create(clonedElement);
  const renderedComponent = testRenderer.getInstance();

  expect(renderedComponent).toBeInstanceOf(TestComponent);
  expect(renderedComponent.props).toMatchObject({ id: 'clone' });

  expect(originalElementRef).toHaveBeenLastCalledWith(renderedComponent);
  expect(clonedElementRef).toHaveBeenLastCalledWith(renderedComponent);

  testRenderer.unmount();

  expect(originalElementRef).toHaveBeenLastCalledWith(null);
  expect(clonedElementRef).toHaveBeenLastCalledWith(null);
});

test(`uses the ref of the original element even if the clone has no ref`, () => {
  const originalElementRef = jest.fn();

  const originalElement = React.createElement(TestComponent, {
    ref: originalElementRef,
  });
  const clonedElement = cloneReferencedElement(originalElement, {
    id: 'clone',
  });

  const testRenderer = TestRenderer.create(clonedElement);
  const renderedComponent = testRenderer.getInstance();

  expect(renderedComponent).toBeInstanceOf(TestComponent);
  expect(renderedComponent.props).toMatchObject({ id: 'clone' });

  expect(originalElementRef).toHaveBeenLastCalledWith(renderedComponent);
});

test(`uses the ref of the cloned element even if the original has no ref`, () => {
  const clonedElementRef = jest.fn();

  const originalElement = React.createElement(TestComponent);
  const clonedElement = cloneReferencedElement(originalElement, {
    ref: clonedElementRef,
    id: 'clone',
  });

  const testRenderer = TestRenderer.create(clonedElement);
  const renderedComponent = testRenderer.getInstance();

  expect(renderedComponent).toBeInstanceOf(TestComponent);
  expect(renderedComponent.props).toMatchObject({ id: 'clone' });

  expect(clonedElementRef).toHaveBeenLastCalledWith(renderedComponent);
});

describe(`development`, () => {
  beforeAll(() => {
    global.__DEV__ = true;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    console.warn.mockRestore();
    delete global.__DEV__;
  });

  test(`warns when the original element's ref is not a callback ref`, () => {
    const clonedElementRef = jest.fn();

    const originalElement = React.createElement(TestComponent, { ref: 'test' });
    const clonedElement = cloneReferencedElement(originalElement, { ref() {} });

    const testRenderer = TestRenderer.create(clonedElement);
    const renderedComponent = testRenderer.getInstance();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      `Cloning an element with a ref that will be overwritten because it is not a function. Use a composable callback ref instead. Ignoring ref:`,
      'test'
    );
  });
});

describe(`production`, () => {
  beforeAll(() => {
    global.__DEV__ = false;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    console.warn.mockRestore();
    delete global.__DEV__;
  });

  test(`doesn't warn when the original element's ref is not a callback ref`, () => {
    const clonedElementRef = jest.fn();

    const originalElement = React.createElement(TestComponent, { ref: 'test' });
    const clonedElement = cloneReferencedElement(originalElement, { ref() {} });

    const testRenderer = TestRenderer.create(clonedElement);
    const renderedComponent = testRenderer.getInstance();

    expect(console.warn).not.toHaveBeenCalled();
  });
});
