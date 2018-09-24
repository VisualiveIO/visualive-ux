import visualiveUxFactory from '../ui/VisualiveUxFactory';

class ParameterContainer {
  constructor(rootElement, parameterOwner) {
    this.rootElement = rootElement;
    this.container = document.createElement('div');
    this.container.className = 'container';
    this.rootElement.appendChild(this.container);

    this.ul = document.createElement('ul');
    this.ul.className = 'flex-outer';
    this.container.appendChild(this.ul);

    this.widgets = [];
    for (let parameter of parameterOwner.getParameters()) {
      this.addParameterWidget(parameter);
    }
  }

  getDomElement() {
    return this.container;
  }

  addParameterWidget(parameter) {
    const parameterName = parameter.getName();

    const li = document.createElement('li');
    this.ul.appendChild(li);

    const labelElem = document.createElement('label');
    labelElem.setAttribute('for', parameterName);
    labelElem.appendChild(document.createTextNode(parameterName));
    li.appendChild(labelElem);

    const widget = visualiveUxFactory.constructWidget(parameter, li);
    if (!widget) {
      console.warn(`Unable to display parameter '${parameterName}'`);
      return;
    }
    this.widgets.push(widget);
  }
}

export default ParameterContainer;
