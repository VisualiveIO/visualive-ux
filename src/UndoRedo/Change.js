import { EventEmitter, Registry } from '@zeainc/zea-engine'

/**
 * Kind of an abstract class, that represents the mandatory structure of a change classes that are used in the [`UndoRedoManager`]().
 *
 * @note If you don't extend this class, ensure to implement all methods specified in here.
 * @extends {EventEmitter}
 */
class Change extends EventEmitter {
  /**
   * Every class that extends from `Change` must contain a global `name` attribute.
   * It is used by the `UndoRedoManager` factory to re-construct the class of the specific implementation of the `Change` class.
   *
   * @param {string} name - The name value.
   */
  constructor(name) {
    super()
    this.name = name
  }

  /**
   * Called by the `UndoRedoManager` in the `undo` method, and contains the code you wanna run when the undo action is triggered,
   * of course it depends on what you're doing.
   *
   * @note This method needs to be implemented, otherwise it will throw an Error.
   */
  undo() {
    throw new Error('Implement me')
  }

  /**
   * Called by the `UndoRedoManager` in the `redo` method, and is the same as the `undo` method, contains the specific code you wanna run.
   *
   * @note This method needs to be implemented, otherwise it will throw an Error.
   */
  redo() {
    throw new Error('Implement me')
  }

  /**
   * Use this method to update the state of your `Change` class.
   *
   * @note This method needs to be implemented, otherwise it will throw an Error.
   *
   * @param {object|string|any} updateData - The updateData param.
   */
  update(updateData) {
    throw new Error('Implement me')
  }

  /**
   * Serializes the `Change` instance as a JSON object, allowing persistence/replication
   *
   * @note This method needs to be implemented, otherwise it will return an empty object.
   *
   * @param {object} context - The appData param.
   * @return {object} The return value.
   */
  toJSON(context) {
    return {}
  }

  /**
   * The counterpart of the `toJSON` method, restoring `Change` instance's state with the specified JSON object.
   * Each `Change` class must implement the logic for reconstructing itself.
   * Very often used to restore from persisted/replicated JSON.
   *
   * @note This method needs to be implemented, otherwise it will do nothing.
   *
   * @param {object} j - The j param.
   * @param {object} context - The context param.
   */
  fromJSON(j, context) {}

  /**
   * Useful method to update the state of an existing identified `Change` through replication.
   *
   * @note By default it calls the `update` method in the `Change` class, but you can override this if you need to.
   *
   * @param {object} j - The j param.
   */
  changeFromJSON(j) {
    // Many change objects can load json directly
    // in the update method.
    this.update(j)
  }

  /**
   * Method destined to clean up things that would need to be cleaned manually.
   * It is executed when flushing the undo/redo stacks or adding a new change to the undo stack,
   * so it is require in any class that represents a change.
   *
   */
  destroy() {}
}

export default Change
export { Change }
