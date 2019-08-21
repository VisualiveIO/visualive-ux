import Change from '../../undoredo/Change.js';
import UndoRedoManager from '../../undoredo/UndoRedoManager.js';

/**
 * Class representing a name value change.
 * @extends Change
 */
class NameValueChange extends Change {
  /**
   * Create a name value change.
   * @param {any} item - The item value.
   * @param {any} newValue - The newValue value.
   */
  constructor(item, newValue) {
    if (item) {
      super(item ? item.getName() + ' Name Changed' : 'NameValueChange');
      this.__prevName = item.getName();
      this.__item = item;
      if (newValue != undefined) {
        this.__nextName = newValue;
        this.__item.setName(this.__nextName);
      }
    } else {
      super();
    }
  }

  /**
   * The getPrevValue method.
   * @return {any} The return value.
   */
  getPrevValue() {
    return this.__prevName;
  }

  /**
   * The getNextValue method.
   * @return {any} The return value.
   */
  getNextValue() {
    return this.__nextName;
  }

  /**
   * The undo method.
   */
  undo() {
    if (!this.__item) return;
    this.__item.setName(this.__prevName);
  }

  /**
   * The redo method.
   */
  redo() {
    if (!this.__item) return;
    this.__item.setName(this.__nextName);
  }

  /**
   * The update method.
   * @param {any} updateData - The updateData param.
   */
  update(updateData) {
    if (!this.__item) return;
    this.__nextName = updateData.value;
    this.__item.setName(this.__nextName);
    this.updated.emit(updateData);
  }

  /**
   * The toJSON method.
   * @param {any} appData - The appData param.
   * @return {any} The return value.
   */
  toJSON(appData) {
    const j = {
      name: this.name,
      itemPath: this.__item.getPath(),
    };
    if (this.__nextName != undefined) {
      if (this.__nextName.toJSON) {
        j.value = this.__nextName.toJSON();
      } else {
        j.value = this.__nextName;
      }
    }
    return j;
  }

  /**
   * The fromJSON method.
   * @param {any} j - The j param.
   * @param {any} appData - The appData param.
   */
  fromJSON(j, appData) {
    const item = appData.scene.getRoot().resolvePath(j.itemPath, 1);
    if (!item || !(item instanceof Visualive.itemeter)) {
      console.warn('resolvePath is unable to resolve', j.itemPath);
      return;
    }
    this.__item = item;
    this.__prevName = this.__item.getName();
    if (this.__prevName.clone) this.__nextName = this.__prevName.clone();
    else this.__nextName = this.__prevName;

    this.name = this.__item.getName() + ' Changed';
    if (j.value != undefined) this.changeFromJSON(j);
  }

  /**
   * The changeFromJSON method.
   * @param {any} j - The j param.
   */
  changeFromJSON(j) {
    if (!this.__item) return;
    if (this.__nextName.fromJSON) this.__nextName.fromJSON(j.value);
    else this.__nextName = j.value;
    this.__item.setName(this.__nextName);
  }
}

UndoRedoManager.registerChange('NameValueChange', NameValueChange);

/** Class representing a name widget. */
export default class NameWidget {
  /**
   * Create a name widget.
   * @param {any} item - The item value.
   * @param {any} parentDomElem - The parentDomElem value.
   * @param {any} appData - The appData value.
   */
  constructor(item, parentDomElem, appData) {
    const input = document.createElement('input');
    input.className = 'mdl-textfield__input';
    input.setAttribute('type', 'text');
    input.setAttribute('value', item.getName());
    input.setAttribute('tabindex', 0);

    parentDomElem.appendChild(input);

    // ///////////////////////////
    // SceneWidget Changes.

    let change;
    item.nameChanged.connect(() => {
      if (!change) {
        input.value = item.getName();
      }
    });

    const valueChange = () => {
      const value = input.value;
      if (!change) {
        change = new NameValueChange(item, value);
        appData.undoRedoManager.addChange(change);
      } else {
        change.update({ value });
      }
    };

    const valueChangeEnd = () => {
      valueChange();
      change = undefined;
    };

    input.addEventListener('input', valueChange);
    input.addEventListener('change', valueChangeEnd);
  }
}
