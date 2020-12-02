import { EventEmitter, Registry } from '@zeainc/zea-engine'

/**
 * `UndoRedoManager` is a mixture of the [Factory Design Pattern](https://en.wikipedia.org/wiki/Factory_method_pattern) and the actual changes stacks manager.
 * This is the heart of the Undo/Redo System, letting you navigate through the changes history you've saved.
 *
 * **Events**
 * * **changeAdded:** Triggered when a change is added.
 * * **changeUpdated:** Triggered when the last change added updates its state.
 * * **changeUndone:** Triggered when the `undo` method is called, after removing the last change from the stack.
 * * **changeRedone:** Triggered when the `redo` method is called, after restoring the last change removed from the undo stack.
 * */
class UndoRedoManager extends EventEmitter {
  /**
   * It doesn't have any parameters, but under the hood it uses [EventsEmitter]() to notify subscribers when something happens.
   * The implementation is really simple, just initialize it like any other class.
   */
  constructor() {
    super()
    this.__undoStack = []
    this.__redoStack = []
    this.__currChange = null

    this.__currChangeUpdated = this.__currChangeUpdated.bind(this)
  }

  /**
   * As the name indicates, it empties undo/redo stacks permanently, losing all stored actions.
   * Right now, before flushing the stacks it calls the `destroy` method on all changes, ensure to at least declare it.
   */
  flush() {
    for (const change of this.__undoStack) change.destroy()
    this.__undoStack = []
    for (const change of this.__redoStack) change.destroy()
    this.__redoStack = []
    if (this.__currChange) {
      this.__currChange.off('updated', this.__currChangeUpdated)
      this.__currChange = null
    }
  }

  /**
   * Receives an instance of a class that extends or has the same structure as `Change` class.
   * When this action happens, the last added change update notifications will get disconnected.
   * Which implies that any future updates to changes that are not the last one, would need a new call to the `addChange` method.
   * Also, resets the redo stack(Calls destroy method when doing it).
   *
   * @param {Change} change - The change param.
   */
  addChange(change) {
    // console.log("AddChange:", change.name)
    if (this.__currChange && this.__currChange.off) {
      this.__currChange.off('updated', this.__currChangeUpdated)
    }

    this.__undoStack.push(change)
    this.__currChange = change
    if (this.__currChange.on) this.__currChange.on('updated', this.__currChangeUpdated)

    for (const change of this.__redoStack) change.destroy()
    this.__redoStack = []

    this.emit('changeAdded', { change })
  }

  /**
   * Returns the last change added to the undo stack, but in case it is empty a `null` is returned.
   *
   * @return {Change|null} The return value.
   */
  getCurrentChange() {
    return this.__currChange
  }

  /**
   * @private
   * @param {object|any} updateData
   */
  __currChangeUpdated(updateData) {
    this.emit('changeUpdated', updateData)
  }

  /**
   * Rollback the latest action, passing it to the redo stack in case you wanna recover it later on.
   *
   * @param {boolean} pushOnRedoStack - The pushOnRedoStack param.
   */
  undo(pushOnRedoStack = true) {
    if (this.__undoStack.length > 0) {
      if (this.__currChange) {
        this.__currChange.off('updated', this.__currChangeUpdated)
        this.__currChange = null
      }

      const change = this.__undoStack.pop()
      // console.log("undo:", change.name)
      change.undo()
      if (pushOnRedoStack) {
        this.__redoStack.push(change)
        this.emit('changeUndone')
      }
    }
  }

  /**
   * Method to cancel the current change added to the UndoRedoManager.
   * Reverts the change and discards it.
   */
  cancel() {
    if (this.__undoStack.length > 0) {
      if (this.__currChange) {
        this.__currChange.off('updated', this.__currChangeUpdated)
        this.__currChange = null
      }

      const change = this.__undoStack.pop()
      change.undo()
    }
  }

  /**
   * Rollbacks the `undo` action by moving the change from the `redo` stack to the `undo` stack.
   * Emits the `changeRedone` event, if you want to subscribe to it.
   */
  redo() {
    if (this.__redoStack.length > 0) {
      const change = this.__redoStack.pop()
      // console.log("redo:", change.name)
      change.redo()
      this.__undoStack.push(change)
      this.emit('changeRedone')
    }
  }

  // //////////////////////////////////
  // User Synchronization

  /**
   * Returns a new instance of the derived `Change` class.
   *
   * @param {string} className - The className param.
   * @return {Change} - The return value.
   */
  constructChange(className) {
    return Registry.constructClass(className)
  }

  /**
   * Checks if a class of an instantiated object is registered in the UndoRedo Factory.
   *
   * @param {Change} inst - The instance of the Change class.
   * @return {boolean} - Returns 'true' if the class has been registered.
   */
  static isChangeClassRegistered(inst) {
    try {
      const name = Registry.getBlueprintName(inst)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Very simple method that returns the name of the instantiated class, checking first in the registry and returning if found,
   * if not then checks the `name` attribute declared in constructor.
   *
   * @param {Change} inst - The instance of the Change class.
   * @return {string} - The return value.
   */
  static getChangeClassName(inst) {
    return Registry.getBlueprintName(inst)
  }

  /**
   * Registers the class in the UndoRedoManager Factory.
   * Why do we need to specify the name of the class?
   * Because when the code is transpiled, the defined class names change, so it won't be known as we declared it anymore.
   *
   * @param {string} name - The name param.
   * @param {Change} cls - The cls param.
   */
  static registerChange(name, cls) {
    Registry.register(name, cls)
  }

  static getInstance() {
    if (!inst) {
      inst = new UndoRedoManager()
    }
    return inst
  }
}

let inst

export default UndoRedoManager
export { UndoRedoManager }
