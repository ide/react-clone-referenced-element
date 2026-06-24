'use strict';

const { test, describe, before, after, mock } = require('node:test');
const assert = require('node:assert');

const React = require('react');
const TestRenderer = require('react-test-renderer');

const cloneReferencedElement = require('../cloneReferencedElement');

class TestComponent extends React.Component {
  render() {
    return null;
  }
}

// Asserts that the most recent call to a mock function received exactly the given arguments
function assertLastCalledWith(fn, ...expectedArguments) {
  const { calls } = fn.mock;
  assert.ok(calls.length > 0, 'expected the mock to have been called at least once');
  assert.deepStrictEqual(calls[calls.length - 1].arguments, expectedArguments);
}

test(`clones an element that uses both the original and cloned elements' callback refs`, () => {
  const originalElementRef = mock.fn();
  const clonedElementRef = mock.fn();

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

  assert.ok(renderedComponent instanceof TestComponent);
  assert.strictEqual(renderedComponent.props.id, 'clone');

  assertLastCalledWith(originalElementRef, renderedComponent);
  assertLastCalledWith(clonedElementRef, renderedComponent);

  testRenderer.unmount();

  assertLastCalledWith(originalElementRef, null);
  assertLastCalledWith(clonedElementRef, null);
});

test(`uses the ref of the original element even if the clone has no ref`, () => {
  const originalElementRef = mock.fn();

  const originalElement = React.createElement(TestComponent, {
    ref: originalElementRef,
  });
  const clonedElement = cloneReferencedElement(originalElement, {
    id: 'clone',
  });

  const testRenderer = TestRenderer.create(clonedElement);
  const renderedComponent = testRenderer.getInstance();

  assert.ok(renderedComponent instanceof TestComponent);
  assert.strictEqual(renderedComponent.props.id, 'clone');

  assertLastCalledWith(originalElementRef, renderedComponent);
});

test(`uses the ref of the cloned element even if the original has no ref`, () => {
  const clonedElementRef = mock.fn();

  const originalElement = React.createElement(TestComponent);
  const clonedElement = cloneReferencedElement(originalElement, {
    ref: clonedElementRef,
    id: 'clone',
  });

  const testRenderer = TestRenderer.create(clonedElement);
  const renderedComponent = testRenderer.getInstance();

  assert.ok(renderedComponent instanceof TestComponent);
  assert.strictEqual(renderedComponent.props.id, 'clone');

  assertLastCalledWith(clonedElementRef, renderedComponent);
});

describe(`development`, () => {
  let warn;

  before(() => {
    global.__DEV__ = true;
    warn = mock.method(console, 'warn', () => {});
  });

  after(() => {
    warn.mock.restore();
    delete global.__DEV__;
  });

  test(`warns when the original element's ref is not a callback ref`, () => {
    const originalElement = React.createElement(TestComponent, { ref: 'test' });
    const clonedElement = cloneReferencedElement(originalElement, { ref() {} });

    TestRenderer.create(clonedElement);

    assert.strictEqual(warn.mock.calls.length, 1);
    assert.deepStrictEqual(warn.mock.calls[0].arguments, [
      `Cloning an element with a ref that will be overwritten because it is not a function. Use a composable callback ref instead. Ignoring ref:`,
      'test',
    ]);
  });
});

describe(`production`, () => {
  let warn;

  before(() => {
    global.__DEV__ = false;
    warn = mock.method(console, 'warn', () => {});
  });

  after(() => {
    warn.mock.restore();
    delete global.__DEV__;
  });

  test(`doesn't warn when the original element's ref is not a callback ref`, () => {
    const originalElement = React.createElement(TestComponent, { ref: 'test' });
    const clonedElement = cloneReferencedElement(originalElement, { ref() {} });

    TestRenderer.create(clonedElement);

    assert.strictEqual(warn.mock.calls.length, 0);
  });
});
