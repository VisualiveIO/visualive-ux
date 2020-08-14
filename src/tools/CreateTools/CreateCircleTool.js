import CreateCircleChange from './Change/CreateCircleChange'
import CreateGeomTool from './CreateGeomTool'

/**
 * Class representing a create circle tool.
 * @extends CreateGeomTool
 */
class CreateCircleTool extends CreateGeomTool {
  /**
   * Create a create circle tool.
   * @param {any} appData - The appData value.
   */
  constructor(appData) {
    super(appData)
  }

  /**
   * The createStart method.
   * @param {any} xfo - The xfo param.
   * @param {any} parentItem - The parentItem param.
   */
  createStart(xfo, parentItem) {
    this.change = new CreateCircleChange(parentItem, xfo)
    this.appData.undoRedoManager.addChange(this.change)

    this.xfo = xfo
    this.stage = 1
    this.radius = 0.0
  }

  /**
   * The createMove method.
   * @param {any} pt - The pt param.
   */
  createMove(pt) {
    this.radius = pt.distanceTo(this.xfo.tr)
    this.change.update({ radius: this.radius })
  }

  /**
   * The createRelease method.
   * @param {any} pt - The pt param.
   */
  createRelease(pt) {
    if (this.radius == 0) {
      this.appData.undoRedoManager.undo(false)
    }
    this.change = null
    this.stage = 0
    this.emit('actionFinished')
  }
}

export default CreateCircleTool
export { CreateCircleTool }
