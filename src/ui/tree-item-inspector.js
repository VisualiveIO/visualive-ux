import ParameterContainer from './parameter-container.js';
import uxFactory from './UxFactory.js';
import NameWidget from './parameter-widgets/NameWidget.js';

/** Class representing a name param. */
class NameParam {
  /**
   * Create a name param.
   * @param {any} treeItem - The treeItem value.
   */
  constructor(treeItem) {
    this._treeItem = treeItem;
    this.valueChanged = treeItem.nameChanged;
  }

  getName() {
    return 'Name';
  }

  getValue() {
    return this._treeItem.getName();
  }

  setValue(name) {
    return this._treeItem.setName(name);
  }
}

export default class TreeItemInspector {
  constructor(treeItem, domElement, appData) {
    const ul = document.createElement('ul');
    ul.className = 'list pa0 pr3';
    const linameWidget = document.createElement('li');
    const liparameterContainer = document.createElement('li');
    domElement.appendChild(ul);
    ul.appendChild(linameWidget);
    ul.appendChild(liparameterContainer);
    this.nameWidget = new NameWidget(treeItem, linameWidget, appData);
    this.parameterContainer = new ParameterContainer(
      treeItem,
      liparameterContainer,
      appData
    );
  }

  destroy() {
    this.parameterContainer.destroy();
  }
}

uxFactory.registerInpector(
  TreeItemInspector,
  p => p instanceof Visualive.TreeItem
);
