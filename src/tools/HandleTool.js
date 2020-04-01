import { Color, GeomItem, Material, Sphere } from '@zeainc/zea-engine'
import BaseTool from './BaseTool.js'
import Handle from '../sceneWidgets/Handle.js'

/**
 * Class representing a scene widget tool.
 * @extends BaseTool
 */
class HandleTool extends BaseTool {
  /**
   * Create a scene widget tool
   * @param {any} appData - The appData value.
   */
  constructor(appData) {
    super(appData)

    this.activeHandle = undefined
    this.capturedItems = []
    this.mouseOverItems = []
  }

  /**
   * The activateTool method.
   */
  activateTool() {
    super.activateTool()
    console.log('activateTool.HandleTool')

    this.appData.renderer.getDiv().style.cursor = 'crosshair'

    const addIconToController = (controller) => {
      // The tool might already be deactivated.
      if (!this.__activated) return
      const geon = new Sphere(0.02 * 0.75)
      const mat = new Material('Cross', 'FlatSurfaceShader')
      mat.getParameter('BaseColor').setValue(new Color('#03E3AC'))
      mat.visibleInGeomDataBuffer = false
      const geomItem = new GeomItem('HandleToolTip', geon, mat)
      controller.getTipItem().removeAllChildren()
      controller.getTipItem().addChild(geomItem, false)
    }
    const addIconToControllers = (xrvp) => {
      for (const controller of xrvp.getControllers()) {
        addIconToController(controller)
      }
      this.addIconToControllerId = xrvp.controllerAdded.connect(
        addIconToController
      )
    }

    this.appData.renderer.getXRViewport().then((xrvp) => {
      addIconToControllers(xrvp)
    })
  }

  /**
   * The deactivateTool method.
   */
  deactivateTool() {
    super.deactivateTool()

    this.appData.renderer.getXRViewport().then((xrvp) => {
      // for(let controller of xrvp.getControllers()) {
      //   controller.getTipItem().removeAllChildren();
      // }
      xrvp.controllerAdded.disconnectId(this.addIconToControllerId)
    })
  }

  // ///////////////////////////////////
  // Mouse events

  /**
   * The onMouseDown method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onMouseDown(event) {
    //
    if (!this.activeHandle) {
      // event.viewport.renderGeomDataFbo();
      const intersectionData = event.viewport.getGeomDataAtPos(event.mousePos)
      if (intersectionData == undefined) return
      if (intersectionData.geomItem.getOwner() instanceof Handle) {
        this.activeHandle = intersectionData.geomItem.getOwner()
        this.activeHandle.handleMouseDown(
          Object.assign(event, { intersectionData })
        )
        return true
      }
    }
  }

  /**
   * The onMouseMove method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onMouseMove(event) {
    if (this.activeHandle) {
      this.activeHandle.handleMouseMove(event)
      return true
    } else {
      // If the buttons are pressed, we know we are not searching
      // for a handle to drag. (Probably anothet tool in the stack is doing something)
      if (event.button == 0 && event.buttons == 1) return false

      const intersectionData = event.viewport.getGeomDataAtPos(event.mousePos)
      if (
        intersectionData != undefined &&
        intersectionData.geomItem.getOwner() instanceof Handle
      ) {
        const handle = intersectionData.geomItem.getOwner()
        if (this.__highlightedHandle) this.__highlightedHandle.unhighlight()

        this.__highlightedHandle = handle
        this.__highlightedHandle.highlight()
        return true
      } else if (this.__highlightedHandle) {
        this.__highlightedHandle.unhighlight()
        this.__highlightedHandle = undefined
      }
    }
  }

  /**
   * The onMouseUp method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onMouseUp(event) {
    if (this.activeHandle) {
      this.activeHandle.handleMouseUp(event)
      this.activeHandle = undefined
      return true
    }
  }

  /**
   * The onWheel method.
   * @param {any} event - The event param.
   */
  onWheel(event) {
    if (this.activeHandle) {
      this.activeHandle.onWheel(event)
    }
  }

  // ///////////////////////////////////
  // Touch events

  /**
   * The onTouchStart method.
   * @param {any} event - The event param.
   */
  onTouchStart(event) {}

  /**
   * The onTouchMove method.
   * @param {any} event - The event param.
   */
  onTouchMove(event) {}

  /**
   * The onTouchEnd method.
   * @param {any} event - The event param.
   */
  onTouchEnd(event) {}

  /**
   * The onTouchCancel method.
   * @param {any} event - The event param.
   */
  onTouchCancel(event) {}

  // ///////////////////////////////////
  // VRController events

  /**
   * The __prepareVREvent method.
   * @param {any} event - The event that occurs.
   * @private
   */
  __prepareVREvent(event) {
    const id = event.controller.getId()
    event.setCapture = (item) => {
      this.capturedItems[id] = item
    }
    event.getCapture = () => {
      return this.capturedItems[id]
    }
    event.releaseCapture = () => {
      this.capturedItems[id] = null
    }
  }

  /**
   * The onVRControllerButtonDown method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onVRControllerButtonDown(event) {
    const id = event.controller.getId()
    if (this.capturedItems[id]) {
      this.__prepareVREvent(event)
      this.capturedItems[id].onMouseDown(event)
    } else {
      const intersectionData = event.controller.getGeomItemAtTip()
      if (intersectionData != undefined) {
        event.intersectionData = intersectionData
        event.geomItem = intersectionData.geomItem
        this.__prepareVREvent(event)
        intersectionData.geomItem.onMouseDown(event)
      }
    }
  }

  /**
   * The onVRPoseChanged method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onVRPoseChanged(event) {
    for (const controller of event.controllers) {
      const id = controller.getId()
      if (this.capturedItems[id]) {
        this.capturedItems[id].onMouseMove(event)
      } else {
        const intersectionData = controller.getGeomItemAtTip()
        if (intersectionData != undefined) {
          event.intersectionData = intersectionData
          event.geomItem = intersectionData.geomItem
          if (intersectionData.geomItem != this.mouseOverItems[id]) {
            if (this.mouseOverItems[id])
              this.mouseOverItems[id].onMouseLeave(event)
            this.mouseOverItems[id] = intersectionData.geomItem
            this.mouseOverItems[id].onMouseEnter(event)
          }
          intersectionData.geomItem.onMouseMove(event)
        } else if (this.mouseOverItems[id]) {
          this.mouseOverItems[id].onMouseLeave(event)
          this.mouseOverItems[id] = null
        }
      }
    }
  }

  /**
   * The onVRControllerButtonUp method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onVRControllerButtonUp(event) {
    this.__prepareVREvent(event)
    const id = event.controller.getId()
    if (this.capturedItems[id]) {
      this.capturedItems[id].onMouseUp(event)
    } else {
      const controller = event.controller
      const intersectionData = controller.getGeomItemAtTip()
      if (intersectionData != undefined) {
        event.intersectionData = intersectionData
        event.geomItem = intersectionData.geomItem
        intersectionData.geomItem.onMouseUp(event)
      }
    }
  }
}

export { HandleTool }
