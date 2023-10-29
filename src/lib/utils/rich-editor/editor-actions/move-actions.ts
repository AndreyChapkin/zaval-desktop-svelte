export interface MoveWithinAction {
    type: 'move',
    name: 'within',
    direction: 'up' | 'down',  
}

export type MoveAction = MoveWithinAction;