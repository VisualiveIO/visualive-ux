import Handle from './Handle.js';
import ParameterValueChange from '../undoredo/ParameterValueChange.js';

/** Class representing a planar movement scene widget.
 * @extends Handle
 */
class PlanarMovementHandle extends Handle {
  /**
   * Create a planar movement scene widget.
   * @param {any} name - The name value.
   * @param {any} size - The size value.
   * @param {any} color - The color value.
   * @param {any} offset - The offset value.
   */
  constructor(name, size, color, offset) {
    super(name);

    this.__color = color;
    this.__hilightedColor = new ZeaEngine.Color(1, 1, 1);
    this.sizeParam = this.addParameter(
      new ZeaEngine.NumberParameter('size', size)
    );
    this.colorParam = this.addParameter(
      new ZeaEngine.ColorParameter('BaseColor', color)
    );

    const handleMat = new ZeaEngine.Material('handle', 'HandleShader');
    handleMat.replaceParameter(this.colorParam);

    const handleGeom = new ZeaEngine.Cuboid(size, size, size * 0.02);

    const handleGeomXfo = new ZeaEngine.Xfo();
    handleGeomXfo.tr = offset;
    handleGeom.transformVertices(handleGeomXfo);
    this.handle = new ZeaEngine.GeomItem('handle', handleGeom, handleMat);

    this.sizeParam.valueChanged.connect(() => {
      size = this.sizeParam.getValue();
      handleGeom.getParameter('size').setValue(size);
      handleGeom.getParameter('height').setValue(size * 0.02);
    });

    this.addChild(this.handle);
  }

  /**
   * The highlight method.
   */
  highlight() {
    this.colorParam.setValue(this.__hilightedColor);
  }

  /**
   * The unhighlight method.
   */
  unhighlight() {
    this.colorParam.setValue(this.__color);
  }

  /**
   * The setTargetParam method.
   * @param {any} param - The param param.
   * @param {boolean} track - The track param.
   */
  setTargetParam(param, track = true) {
    this.param = param;
    if (track) {
      const __updateGizmo = () => {
        this.setGlobalXfo(param.getValue());
      };
      __updateGizmo();
      param.valueChanged.connect(__updateGizmo);
    }
  }

  /**
   * The onDragStart method.
   * @param {any} event - The event param.
   */
  onDragStart(event) {
    this.grabPos = event.grabPos;
    this.baseXfo = this.param.getValue();
    if (event.undoRedoManager) {
      this.change = new ParameterValueChange(this.param);
      event.undoRedoManager.addChange(this.change);
    }
  }

  /**
   * The onDrag method.
   * @param {any} event - The event param.
   */
  onDrag(event) {
    const dragVec = event.holdPos.subtract(this.grabPos);

    const newXfo = this.baseXfo.clone();
    newXfo.tr.addInPlace(dragVec);

    if (this.change) {
      this.change.update({
        value: newXfo,
      });
    } else {
      this.param.setValue(newXfo);
    }
  }

  /**
   * The onDragEnd method.
   * @param {any} event - The event param.
   */
  onDragEnd(event) {
    this.change = null;
  }
}
export { PlanarMovementHandle };