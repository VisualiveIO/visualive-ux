class TreeItemView extends HTMLElement {
  css = `
    /* tree-view.css */

    /* fallback */
    @font-face {
      font-family: 'Material Icons';
      font-style: normal;
      font-weight: 400;
      src: url(https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');
    }

    /* fallback */
    @font-face {
      font-family: 'Material Icons Outlined';
      font-style: normal;
      font-weight: 400;
      src: url(https://fonts.gstatic.com/s/materialiconsoutlined/v14/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUcel5euIg.woff2) format('woff2');
    }

    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }

    .material-icons-outlined {
      font-family: 'Material Icons Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }

    .TreeNodesList {
      border-left: 1px dotted;
      list-style-type: none;
      padding: 0 0 0 15px;
      margin: 0 0 0 10px;
    }

    .TreeNodesList--collapsed {
      display: none;
    }

    .TreeNodesList--root {
      border: none;
      margin: 0;
      padding: 0;
      width: max-content;
    }

    .TreeNodesListItem{
      display: flex;
    }

    .TreeNodesListItem__ToggleVisibility {
      border: none;
      color: #333;
      height: 24px;
      padding: 0;
      width: 25px;
    }

    .TreeNodesListItem__ToggleVisibility:focus {
      outline: none;
    }

    .TreeNodesListItem__ToggleExpanded {
      border: none;
      height: 24px;
      width: 24px;
      padding: 0;
      background-color: #0000;
      outline: none;
    }

    .TreeNodesListItem::before {
      border-bottom: 1px dotted;
      content: '';
      display: inline-block;
      left: -15px;
      position: relative;
      top: -5px;
      width: 10px;
    }

    .TreeNodesListItem__Toggle:focus {
      outline: none;
    }

    .TreeNodeHeader{
      display: flex;
      margin: 0.4em auto;
    }

    .TreeNodesListItem__Title {
      cursor: default;
      padding: 2px 4px;
      border-radius: 5px;
    }

    .TreeNodesListItem__Title:hover {
      background-color: #e1f5fe;
    }
    .TreeNodesListItem__Hover {
      background-color: #e1f5fe;
    }

    .TreeNodesListItem__Dragging {
      background-color: #e1f5fe;
    }

    .TreeNodesListItem--isSelected > .TreeNodeHeader > .TreeNodesListItem__Title {
      background-color: #76d2bb;
      color: #3B3B3B;
    }

    .TreeNodesListItem--isHidden > .TreeNodeHeader >  .TreeNodesListItem__Title {
      color: #9e9e9e;
    }

    .TreeNodesListItem--isHighlighted > .TreeNodeHeader >  .TreeNodesListItem__Title {
      border-style: solid;
      border-width: thin;
    }

    /* Rules for sizing the icon. */
    .material-icons-outlined.md-15,
    .material-icons.md-15 {
      font-size: 15px;
    }
    .material-icons.md-18 {
      font-size: 18px;
    }
    .material-icons.md-24 {
      font-size: 24px;
    }
    .material-icons.md-36 {
      font-size: 36px;
    }
    .material-icons.md-48 {
      font-size: 48px;
    }

    /* Rules for using icons as black on a light background. */
    .material-icons.md-dark {
      color: rgba(0, 0, 0, 0.54);
    }
    .material-icons.md-dark.md-inactive {
      color: rgba(0, 0, 0, 0.26);
    }

    /* Rules for using icons as white on a dark background. */
    .material-icons.md-light {
      color: rgba(255, 255, 255, 1);
    }
    .material-icons.md-light.md-inactive {
      color: rgba(255, 255, 255, 0.3);
    }
    `;

  constructor() {
    super();

    var shadowRoot = this.attachShadow({ mode: 'open' });

    // Add component CSS
    const styleTag = document.createElement('style');
    styleTag.appendChild(document.createTextNode(this.css));
    shadowRoot.appendChild(styleTag);

    // Create container tags
    this.itemContainer = document.createElement('div');

    this.itemHeader = document.createElement('div');
    this.itemHeader.className = 'TreeNodeHeader';
    this.itemContainer.appendChild(this.itemHeader);

    this.itemChildren = document.createElement('div');
    this.itemChildren.className = 'TreeNodesList';
    this.itemContainer.appendChild(this.itemChildren);

    // Item expand button
    this.expandBtn = document.createElement('button');
    this.expandBtn.className = 'TreeNodesListItem__ToggleExpanded';
    this.itemHeader.appendChild(this.expandBtn);

    this.expanded = false;
    this.childrenAlreadyCreated = false;

    this.expandBtn.addEventListener('click', () => {
      if (this.treeItem.getNumChildren() > 0) {
        this.expanded ? this.collapse() : this.expand();
      }
    });

    // Visibility toggle button
    this.toggleVisibilityBtn = document.createElement('button');
    this.toggleVisibilityBtn.className = 'TreeNodesListItem__ToggleVisibility';

    this.itemHeader.appendChild(this.toggleVisibilityBtn);
    this.toggleVisibilityBtn.innerHTML =
      '<i class="material-icons-outlined md-15">visibility</i>';

    // Title element
    this.titleElement = document.createElement('span');
    this.titleElement.className = 'TreeNodesListItem__Title';
    this.titleElement.addEventListener('click', e => {
      if (!this.appData || !this.appData.selectionManager) {
        this.treeItem.setSelected(!this.treeItem.getSelected());
        return;
      }
      if (appData.selectionManager.pickingModeActive()) {
        appData.selectionManager.pick(this.treeItem);
        return;
      }
      appData.selectionManager.toggleItemSelection(this.treeItem, !e.ctrlKey);
    });

    this.itemHeader.appendChild(this.titleElement);

    //
    shadowRoot.appendChild(this.itemContainer);
  }

  setTreeItem(treeItem, appData) {
    this.treeItem = treeItem;

    this.appData = appData;

    ////////////////////////
    // Name
    this.titleElement.textContent = treeItem.getName();
    const updateName = () => {
      this.titleElement.textContent = treeItem.getName();
    };
    this.treeItem.nameChanged.connect(updateName);

    ////////////////////////
    // Visiblity
    this.toggleVisibilityBtn.addEventListener('click', () => {
      const visibleParam = this.treeItem.getParameter('Visible');
      if (this.appData && this.appData.undoRedoManager) {
        const change = new ParameterValueChange(
          visibleParam,
          !visibleParam.getValue()
        );
        this.appData.undoRedoManager.addChange(change);
      } else {
        visibleParam.setValue(!visibleParam.getValue());
      }
    });
    this.updateVisibilityId = this.treeItem.visibilityChanged.connect(
      this.updateVisibility.bind(this)
    );
    this.updateVisibility();

    ////////////////////////
    // Selection

    this.updateSelectedId = this.treeItem.selectedChanged.connect(
      this.updateSelected.bind(this)
    );
    this.updateSelected();

    ////////////////////////
    // Highlights

    this.updateHighlightId = this.treeItem.highlightChanged.connect(
      this.updateHighlight.bind(this)
    );
    this.updateHighlight();

    if (this.treeItem.getChildren().length) {
      this.collapse();
    }
  }

  updateVisibility() {
    const visible = this.treeItem.getVisible();
    visible
      ? this.itemContainer.classList.remove('TreeNodesListItem--isHidden')
      : this.itemContainer.classList.add('TreeNodesListItem--isHidden');

    if (visible) {
      this.toggleVisibilityBtn.innerHTML =
        '<i class="material-icons-outlined md-15">visibility</i>';
    } else {
      this.toggleVisibilityBtn.innerHTML =
        '<i class="material-icons-outlined md-15">visibility_off</i>';
    }
  }

  updateSelected() {
    const selected = this.treeItem.getSelected();
    if (selected)
      this.itemContainer.classList.add('TreeNodesListItem--isSelected');
    else this.itemContainer.classList.remove('TreeNodesListItem--isSelected');
  }

  updateHighlight() {
    const hilighted = this.treeItem.isHighlighted();
    if (hilighted)
      this.itemContainer.classList.add('TreeNodesListItem--isHighlighted');
    else
      this.itemContainer.classList.remove('TreeNodesListItem--isHighlighted');
    if (hilighted) {
      this.titleElement.style[
        'border-color'
      ] = this.treeItem.getHighlight().toHex();
    }
  }

  /**
   * The expand method.
   */
  expand() {
    this.expanded = true;
    this.itemChildren.classList.remove('TreeNodesList--collapsed');
    this.expandBtn.innerHTML =
      '<i class="material-icons md-24">arrow_drop_down</i>';

    if (!this.childrenAlreadyCreated) {
      const children = this.treeItem.getChildren();
      children.forEach((childItem, index) => {
        // if (!childItem.testFlag(ZeaEngine.ItemFlags.INVISIBLE))
        this.addChild(childItem, index);
      });
      this.childrenAlreadyCreated = true;
    }
  }

  /**
   * The collapse method.
   */
  collapse() {
    this.itemChildren.classList.add('TreeNodesList--collapsed');
    this.expandBtn.innerHTML =
      '<i class="material-icons md-24">arrow_right</i>';
    this.expanded = false;
  }

  /**
   * The addChild method.
   * @param {any} treeItem - The treeItem param.
   * @param {number} index - The expanded param.
   */
  addChild(treeItem, index) {
    if (this.expanded) {
      const childTreeItem = document.createElement('tree-item-view');
      childTreeItem.setTreeItem(treeItem, this.appData);

      //   if(index == this.childElements.length)
      this.itemChildren.appendChild(childTreeItem);
      //   else {
      //     this.ul.insertBefore(childTreeItem, this.childElements[index]);
      //   }
      //   this.childElements.splice(index, 0, childTreeItem);
    } else {
      this.collapse();
    }
  }
}

customElements.define('tree-item-view', TreeItemView);
