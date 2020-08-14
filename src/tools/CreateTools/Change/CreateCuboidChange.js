import { Cuboid, Material, GeomItem } from '@zeainc/zea-engine'
import UndoRedoManager from '../../../UndoRedo/UndoRedoManager'
import CreateGeomChange from './CreateGeomChange'

/**
 * Class representing a create cuboid change.
 * @extends CreateGeomChange
 */
class CreateCuboidChange extends CreateGeomChange {
  /**
   * Create a create cuboid change.
   * @param {any} parentItem - The parentItem value.
   * @param {any} xfo - The xfo value.
   */
  constructor(parentItem, xfo) {
    super('Create Cuboid')

    this.cuboid = new Cuboid(0, 0, 0, true)
    const material = new Material('Cuboid', 'SimpleSurfaceShader')
    this.geomItem = new GeomItem('Cuboid')
    this.geomItem.setGeometry(this.cuboid)
    this.geomItem.setMaterial(material)

    if (parentItem && xfo) {
      this.setParentAndXfo(parentItem, xfo)
    }
  }

  /**
   * The update method.
   * @param {any} updateData - The updateData param.
   */
  update(updateData) {
    if (updateData.baseSize) {
      this.cuboid.setBaseSize(updateData.baseSize[0], updateData.baseSize[1])
    }
    if (updateData.tr) {
      const xfo = this.geomItem.getParameter('LocalXfo').getValue()
      xfo.tr.fromJSON(updateData.tr)
      this.geomItem.getParameter('LocalXfo').setValue(xfo)
    }
    if (updateData.height) {
      this.cuboid.z = updateData.height
    }
    this.emit('updated', updateData)
  }
}
UndoRedoManager.registerChange('CreateCuboidChange', CreateCuboidChange)

export default CreateCuboidChange
export { CreateCuboidChange }
