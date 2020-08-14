import Handle from './Handle'

/**
 * Class representing a base linear movement scene widget.
 *
 * @extends Handle
 */
class BaseLinearMovementHandle extends Handle {
  /**
   * Create base linear movement scene widget.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
  }

  // ///////////////////////////////////
  // Mouse events

  /**
   * Handles mouse down interaction with the handle.
   *
   * @param {MouseEvent} event - The event param.
   * @return {boolean} - The return value.
   */
  handleMouseDown(event) {
    this.gizmoRay = this.getManipulationPlane()
    this.grabDist = event.mouseRay.intersectRayVector(this.gizmoRay)[1]
    const grabPos = this.gizmoRay.pointAtDist(this.grabDist)
    event.grabDist = this.grabDist
    event.grabPos = grabPos
    this.onDragStart(event)
    return true
  }

  /**
   * Handles mouse move interaction with the handle.
   *
   * @param {MouseEvent} event - The event param
   */
  handleMouseMove(event) {
    const dist = event.mouseRay.intersectRayVector(this.gizmoRay)[1]
    const holdPos = this.gizmoRay.pointAtDist(dist)
    event.holdDist = dist
    event.holdPos = holdPos
    event.value = dist
    event.delta = dist - this.grabDist
    this.onDrag(event)
  }

  /**
   * Handles mouse up interaction with the handle.
   *
   * @param {MouseEvent} event - The event param.
   * @return {boolean} - The return value.
   */
  handleMouseUp(event) {
    const dist = event.mouseRay.intersectRayVector(this.gizmoRay)[1]
    const releasePos = this.gizmoRay.pointAtDist(dist)
    event.releasePos = releasePos
    this.onDragEnd(event)
    return true
  }

  // ///////////////////////////////////
  // VRController events

  /**
   * Event fired when a VR controller button is pressed over the handle.
   *
   * @param {object} event - The event param.
   * @return {boolean} The return value.
   */
  onVRControllerButtonDown(event) {
    this.gizmoRay = this.getManipulationPlane()

    this.activeController = event.controller
    const xfo = this.activeController.getTipXfo()
    this.grabDist = xfo.tr.subtract(this.gizmoRay.start).dot(this.gizmoRay.dir)
    const grabPos = this.gizmoRay.start.add(this.gizmoRay.dir.scale(this.grabDist))
    event.grabPos = grabPos
    this.onDragStart(event)
    return true
  }

  /**
   * The onVRPoseChanged method.
   *
   * @param {object} event - The event param.
   * @return {boolean} The return value.
   */
  onVRPoseChanged(event) {
    const xfo = this.activeController.getTipXfo()
    const dist = xfo.tr.subtract(this.gizmoRay.start).dot(this.gizmoRay.dir)
    const holdPos = this.gizmoRay.start.add(this.gizmoRay.dir.scale(dist))
    event.value = dist
    event.holdPos = holdPos
    event.delta = dist - this.grabDist
    this.onDrag(event)
    return true
  }

  /**
   * Event fired when a VR controller button is released over the handle.
   *
   * @param {object} event - The event param.
   * @return {boolean} - The return value.
   */
  onVRControllerButtonUp(event) {
    if (this.activeController == event.controller) {
      // const xfo = this.activeController.getTipXfo()
      this.onDragEnd()
      this.activeController = undefined
      return true
    }
  }
}

export default BaseLinearMovementHandle
export { BaseLinearMovementHandle }
