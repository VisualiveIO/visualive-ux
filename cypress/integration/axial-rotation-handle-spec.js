import { createTouchEvents, cyFocusCanvas } from './utils'

describe('Axial Rotation Handle', () => {
  beforeEach(() => {
    cy.visit('testing-e2e/axial-rotation-handle.html', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage')
      },
    })
  })

  it('Axial Rotation Handle Highlights', () => {
    cyFocusCanvas()

    cy.get('canvas').trigger('mousemove', 400, 40).trigger('mousemove', 555, 330)
    cy.wait(100)
    cy.get('canvas').percySnapshot('AxialRotationHandleHighlights')
  })
  it('Axial Rotation Handle Highlights Different Color', () => {
    cyFocusCanvas()

    cy.get('canvas').trigger('mousemove', 700, 40).trigger('mousemove', 280, 430)
    cy.wait(100)
    cy.get('canvas').percySnapshot('AxialRotationHandleHighlightsDifferentColor')
  })

  it('Axial Rotation Handle Moves - Mouse', () => {
    cy.get('canvas').trigger('mousedown', 280, 430).trigger('mousemove', 400, 430).trigger('mouseup', 400, 430)
    cy.wait(100)
    cy.get('canvas').percySnapshot('AxialRotationHandleMovesMouse')
  })

  it('Axial Rotation Handle Moves - Touch', () => {
    const eTouchStart = createTouchEvents([555, 330])
    const eTouch = createTouchEvents([555, 530])

    cy.get('canvas').trigger('touchstart', eTouchStart).trigger('touchmove', eTouch).trigger('touchend', eTouch)
    cy.wait(100)
    cy.get('canvas').percySnapshot(`AxialRotationHandleMovesTouch`)
  })
})
