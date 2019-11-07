import uxFactory from './UxFactory.js';
import ParameterValueChange from '../undoredo/ParameterValueChange.js';

/** Class representing a tree item element. */
class TreeItemElement {
  /**
   * Create a tree item element.
   * @param {any} treeItem - The treeItem value.
   * @param {any} parentDomElement - The parentDomElement value.
   * @param {any} appData - The appData value.
   * @param {boolean} expanded - The expanded value.
   */
  constructor(treeItem, parentDomElement, appData, expanded = false) {
    this.treeItem = treeItem;
    this.parentDomElement = parentDomElement;
    this.appData = appData;

    this.li = document.createElement('li');
    this.li.className = 'TreeNodesListItem';
    this.li.treeItem = treeItem;

    this.expandBtn = document.createElement('button');
    this.expandBtn.className = 'TreeNodesListItem__ToggleExpanded';
    this.li.appendChild(this.expandBtn);

    if (treeItem instanceof ZeaEngine.TreeItem) {
      // Visibility toggle.
      this.toggleVisibilityBtn = document.createElement('button');
      this.toggleVisibilityBtn.className = 'TreeNodesListItem__ToggleVisibility';
      this.li.appendChild(this.toggleVisibilityBtn);
      this.toggleVisibilityBtn.innerHTML =
        '<i class="material-icons md-15">visibility</i>';

      this.toggleVisibilityBtn.addEventListener('click', () => {
        const visibleParam = this.treeItem.getParameter('Visible');
        const change = new ParameterValueChange(
          visibleParam,
          !visibleParam.getValue()
        );
        this.appData.undoRedoManager.addChange(change);
      });

 
      this.updateVisibilityId = this.treeItem.visibilityChanged.connect(this.updateVisibility.bind(this));
      this.updateVisibility();
    }

    // Title element.
    this.titleElement = document.createElement('span');
    this.titleElement.className = 'TreeNodesListItem__Title';
    this.titleElement.textContent = treeItem.getName();
    const updateName = () => {
      this.titleElement.textContent = treeItem.getName();
    };
    this.treeItem.nameChanged.connect(updateName);

    this.li.appendChild(this.titleElement);

    this.titleElement.addEventListener('click', e => {
      if (appData.selectionManager.pickingModeActive()) {
        appData.selectionManager.pick(this.treeItem);
        return;
      }

      appData.selectionManager.toggleItemSelection(this.treeItem, !e.ctrlKey);
    });


    this.updateSelectedId = this.treeItem.selectedChanged.connect(this.updateSelected.bind(this));
    this.updateSelected();

    if (treeItem instanceof ZeaEngine.TreeItem) {
      this.updateHighlightId = this.treeItem.highlightChanged.connect(this.updateHighlight.bind(this));
      this.updateHighlight();
    }
    
    this.parentDomElement.appendChild(this.li);

    this.ul = document.createElement('ul');
    this.ul.className = 'TreeNodesList';
    this.li.appendChild(this.ul);

    this.childElements = [];
    this.expanded = false;

    if (treeItem instanceof ZeaEngine.TreeItem) {
      if (expanded) {
        this.expand();
      } else {
        const children = this.treeItem.getChildren();
        if (children.length > 0) this.collapse();
      }

      this.expandBtn.addEventListener('click', () => {
        if (this.treeItem.getNumChildren() > 0) {
          this.expanded ? this.collapse() : this.expand();
        }
      });

      this.childAddedId = this.treeItem.childAdded.connect(this.childAdded.bind(this));
      this.childRemovedId = this.treeItem.childRemoved.connect(this.childRemoved.bind(this));
      

      this.titleElement.onmousedown = (event) => { // (1) start the process
        event.stopPropagation()
        event.preventDefault()
        console.log("event")
        // onmousedown
        const clientX = event.clientX
        const clientY = event.clientY
        let shiftX = clientX - this.li.getBoundingClientRect().left;
        let shiftY = clientY - this.li.getBoundingClientRect().top;

        let dragging = false;
        let li;
        let dropTarget;
      
        const onMouseMove = (event) => {
          if (!dragging) {
            const dX = event.clientX - clientX
            const dY = event.clientY - clientY
            if (Math.abs(dX) > 10 && Math.abs(dY) > 10) {
              
              // li = this.li.cloneNode(true);
              
              li = document.createElement('li');
              li.className = 'TreeNodesListItem';
              li.classList.add('TreeNodesListItem--isHighlighted')
              li.classList.add('TreeNodesListItem--isSelected')
              li.classList.add('TreeNodesListItem__Dragging')
              
              // li.appendChild(this.expandBtn.cloneNode(true));
              // if (treeItem instanceof ZeaEngine.TreeItem) {
              //   li.appendChild(this.toggleVisibilityBtn.cloneNode(true));
              // }
              li.appendChild(this.titleElement.cloneNode(true));

              // (2) prepare to moving: make absolute and on top by z-index
              li.style.position = 'absolute';
              li.style.zIndex = 1000;
              // move it out of any current parents directly into body
              // to make it positioned relative to the body
              document.body.append(li);
              // document.body.insertBefore(li, document.body.firstChild);
              // ...and put that absolutely positioned ball under the pointer

              dragging = true;
            }
          }
          
          if (dragging) {
            li.style.left = event.pageX - shiftX + 'px';
            li.style.top = event.pageY - shiftY + 'px';
            li.hidden = true;
            const elemBelow = document.elementFromPoint(event.clientX, event.clientY)
            if (
              elemBelow.className == 'TreeNodesListItem__Title' &&
              elemBelow.parentElement.treeItem instanceof ZeaEngine.TreeItem
            ) {
              const liBelow = elemBelow.parentElement;
              if (dropTarget && dropTarget != liBelow) {
                dropTarget.classList.remove('TreeNodesListItem--isHighlighted')
              }
              if (liBelow == this.li) {
                dropTarget = null
              } else if (liBelow && dropTarget != liBelow) {
                dropTarget = liBelow;
                dropTarget.classList.add('TreeNodesListItem--isHighlighted')
              }
            }
            li.hidden = false;
          }
        }
      
        // (3) move the li on mousemove
      
        // (4) drop the li, remove unneeded handlers
        const mouseUp = event => {
          if (li)
            document.body.removeChild(li);
          if (dropTarget) {
            dropTarget.treeItem.addChild(this.treeItem, true)
          }

          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', mouseUp);
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', mouseUp)
      
      };
    }
    this.li.ondragstart = function() {
      return false;
    };
  }

  updateVisibility () {
    const visible = this.treeItem.getVisible();
    visible
      ? this.li.classList.remove('TreeNodesListItem--isHidden')
      : this.li.classList.add('TreeNodesListItem--isHidden');
  }
  updateSelected() {
    const selected = this.treeItem.getSelected();
    if(selected)
      this.li.classList.add('TreeNodesListItem--isSelected')
    else this.li.classList.remove('TreeNodesListItem--isSelected');
  }
  
  updateHighlight () {
    const hilighted = this.treeItem.isHighlighted();
    if (hilighted)
      this.li.classList.add('TreeNodesListItem--isHighlighted')
    else this.li.classList.remove('TreeNodesListItem--isHighlighted');
    if (hilighted) {
      this.titleElement.style[
        'border-color'
      ] = this.treeItem.getHighlight().toHex();
    }
  }

  childAdded (childItem) {
    // if (!childItem.testFlag(ZeaEngine.ItemFlags.INVISIBLE))
      this.addChild(childItem);
  }

  childRemoved (childItem, index) {
    if (this.expanded) {
      this.childElements[index].destroy()
      this.childElements.splice(index, 1);
    }
  }

  /**
   * The addComponent method.
   * @param {any} component - The component param.
   */
  addComponent(component) {
    if (!this.subul) {
      this.subul = document.createElement('ul');
      // this.subul.className = 'TreeNodesList';
      this.titleElement.appendChild(this.subul);
    }

    // Title element.
    const li = document.createElement('li');
    li.className = 'TreeNodesListItem';
    const nameElement = document.createElement('span');
    nameElement.className = 'TreeNodesListItem__Title';
    nameElement.textContent = component;
    li.appendChild(nameElement);
    this.subul.appendChild(li);
  }

  /**
   * The addChild method.
   * @param {any} treeItem - The treeItem param.
   * @param {boolean} expanded - The expanded param.
   */
  addChild(treeItem, expanded = false) {
    if (this.expanded) {
      const childTreeItem = uxFactory.constructTreeItemElement(
        treeItem,
        this.ul,
        this.appData,
        expanded
      );
      this.childElements.push(childTreeItem);
    } else {
      this.collapse();
    }
  }

  getChild(index) {
    return this.childElements[index]
  }

  /**
   * The expand method.
   */
  expand() {
    this.expanded = true;
    this.ul.classList.remove('TreeNodesList--collapsed');
    this.expandBtn.innerHTML =
      '<i class="material-icons md-24">arrow_drop_down</i>';

    if (!this.childrenAlreadyCreated) {
      const children = this.treeItem.getChildren();
      for (const childItem of children) {
        // if (!childItem.testFlag(ZeaEngine.ItemFlags.INVISIBLE))
          this.addChild(childItem);
      }
      this.childrenAlreadyCreated = true;
    }
  }

  /**
   * The collapse method.
   */
  collapse() {
    this.ul.classList.add('TreeNodesList--collapsed');
    this.expandBtn.innerHTML =
      '<i class="material-icons md-24">arrow_right</i>';
    this.expanded = false;
  }

  /**
   * The destroy method.
   */
  destroy() {
    this.treeItem.selectedChanged.disconnectId(this.updateSelectedId);
    if (this.treeItem instanceof ZeaEngine.TreeItem) {
      this.treeItem.highlightChanged.disconnectId(this.updateHighlightId);
      this.treeItem.visibilityChanged.disconnectId(this.updateVisibilityId);
      this.treeItem.childAdded.disconnectId(this.childAddedId);
      this.treeItem.childRemoved.disconnectId(this.childRemovedId);
    }
    this.parentDomElement.removeChild(this.li);
  }
}

uxFactory.registerTreeItemElement(
  TreeItemElement,
  p => p instanceof ZeaEngine.BaseItem
);

/**
 * Class representing a geom item element.
 * @extends TreeItemElement
 */
class GeomItemElement extends TreeItemElement {
  /**
   * Create a geom item element.
   * @param {any} treeItem - The treeItem value.
   * @param {any} parentDomElement - The parentDomElement value.
   * @param {any} appData - The appData value.
   * @param {boolean} expanded - The expanded value.
   */
  constructor(treeItem, parentDomElement, appData, expanded = false) {
    super(treeItem, parentDomElement, appData, expanded);

    // this.addComponent('material')
    // this.addComponent('geometry')
  }
}

uxFactory.registerTreeItemElement(
  GeomItemElement,
  p => p instanceof ZeaEngine.GeomItem
);

/** Class representing a scene tree view. */
class SceneTreeView {
  /**
   * Create a scene tree view.
   * @param {any} rootTreeItem - The rootTreeItem value.
   * @param {any} appData - The appData value.
   */
  constructor(rootTreeItem, appData) {
    this.appData = appData;
    this.mouseOver = false;

    this.ul = document.createElement('ul');
    this.ul.className = 'TreeNodesList TreeNodesList--root';

    this.rootTreeItem = rootTreeItem;
    this.rootElement = new TreeItemElement(
      rootTreeItem,
      this.ul,
      appData,
      true
    );
  }

  /**
   * The getDomElement method.
   * @return {any} The return value.
   */
  getDomElement() {
    return this.container;
  }

  /**
   * The mount method.
   * @param {any} parentElement - The parentElement param.
   */
  mount(parentElement) {
    this.parentDomElement = parentElement;
    this.parentDomElement.appendChild(this.ul);

    // This handler will be executed only once when the cursor
    // moves over the unordered list
    this.parentDomElement.addEventListener(
      'mouseenter',
      this.__onMouseEnter.bind(this),
      false
    );
    this.parentDomElement.addEventListener(
      'mouseleave',
      this.__onMouseLeave.bind(this),
      false
    );

    document.addEventListener("keydown", this.__onKeyDown.bind(this));
  }

  /**
   * The unMount method.
   * @param {any} parentElement - The parentElement param.
   */
  unMount(parentElement) {
    this.parentDomElement.removeChild(this.ul);
    this.parentDomElement.removeEventListener(
      'mouseenter',
      this.__onMouseEnter.bind(this)
    );
    this.parentDomElement.removeEventListener(
      'mouseleave',
      this.__onMouseLeave.bind(this)
    );
    document.removeEventListener("keydown", this.__onKeyDown.bind(this));
  }

  __onMouseEnter(event) {
    this.mouseOver = true
  }
  
  __onMouseLeave(event) {
    this.mouseOver = false
  }
  
  __onKeyDown(event) {
    console.log("keydown", event.key)

    const { selectionManager } = this.appData
    if (this.mouseOver && event.key == 'f') {
      const selectedItems = selectionManager.getSelection();
      this.expandSelection(selectedItems, true);
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    if (event.key == 'ArrowLeft'){
      const selectedItems = selectionManager.getSelection();
      const newSelection = new Set();
      Array.from(selectedItems).forEach(item => {
        newSelection.add(item.getOwner());
      });
      if (newSelection.size > 0) {
        selectionManager.setSelection(newSelection);
      }
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    if (event.key == 'ArrowRight'){
      const selectedItems = selectionManager.getSelection();
      const newSelection = new Set();
      Array.from(selectedItems).forEach(item => {
        if (item instanceof ZeaEngine.TreeItem && item.getNumChildren() > 0)
          newSelection.add(item.getChild(0));
      });
      if (newSelection.size > 0) {
        selectionManager.setSelection(newSelection);
        this.expandSelection(newSelection, true);
      }
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    if (event.key == 'ArrowUp'){
      const selectedItems = selectionManager.getSelection();
      const newSelection = new Set();
      Array.from(selectedItems).forEach(item => {
        const index = item.getOwner().getChildIndex(item);
        if (index == 0) newSelection.add(item.getOwner());
        else {
          newSelection.add(item.getOwner().getChild(index-1));
        }
      });
      if (newSelection.size > 0) {
        selectionManager.setSelection(newSelection);
        this.expandSelection(newSelection);
      }
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    if (event.key == 'ArrowDown') {
      const selectedItems = selectionManager.getSelection();
      const newSelection = new Set();
      Array.from(selectedItems).forEach(item => {
        const index = item.getOwner().getChildIndex(item);
        if(index < item.getOwner().getNumChildren() - 1)
          newSelection.add(item.getOwner().getChild(index+1));
        else {
          const indexinOwner = item.getOwner().getChildIndex(item);
          if (item.getOwner().getNumChildren() > indexinOwner + 1)
            newSelection.add(item.getOwner().getChild(indexinOwner + 1));
        }
      });
      if (newSelection.size > 0) {
        selectionManager.setSelection(newSelection);
        this.expandSelection(newSelection, true);
      }
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }
  /**
   * The expandSelection method.
   * @param {Map} items - The items we wish to expand to show.
   */
  expandSelection(items, scrollToView=true) {
    Array.from(items).forEach(item => {
      const path = [];
      while (true) {
        path.splice(0, 0, item);
        item = item.getOwner();
        if (!item) break;
      }
      let treeViewItem = this.rootElement;
      path.forEach((item, index) => {
        if (index < path.length - 1) {
          if (!treeViewItem.expanded) treeViewItem.expand();
          const childIndex = item.getChildIndex(path[index + 1]);
          treeViewItem = treeViewItem.getChild(childIndex);
        }
      });
      // causes the element to be always at the top of the view.
      if (scrollToView && treeViewItem)
        treeViewItem.titleElement.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'nearest',
        });
    });
  }
}

export { SceneTreeView };
