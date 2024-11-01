import * as THREE from 'three';
import { Size } from '../test/3dobjects';

export interface ILoginResponse {
    accessToken: string;
    expiresIn: number
  }

  export interface IResponse<T> {
    data: T;
  }

  export interface IEventType {
    eventTypeId?: number;               // Primary key, optional as it's auto-generated
    eventTypeName: string;     // Name of the event type
  }

  export interface IEvent {
    id?: number;               // Primary key, optional since it's auto-generated
    userId: number;            // Foreign key referencing the user associated with the event
    eventName: string;         // Name of the event
    eventType: IEventType;       // Foreign key referencing the type of the event
  }
  export interface ITask{
    id?:number;
    taskName?: string;
    description?: string;
    creationDate?: string;
    updateDate?: string;
    dueDate?: string;
    priority?: string;
    event?: IEvent
  }


  export interface ITaskProgress{
    id?:number;
    task?: ITask;
    status?: string;
    changeDate?: string;
  }


  export interface IRole {
    createdAt: string;
    description: string;
    id: number;
    name : string;
    updatedAt: string;
  }

  export interface ISearch {
    page?: number;
    size?: number;
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?:number;
  }

  export interface IUser {
    id?: number;
    name?: string;
    lastname?: string;
    email?: string;
    password?: string;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
    authorities?: IAuthority[];
    role?: IRole
  }

  export interface IAuthority {
    authority: string;
  }

  export interface IFeedBackMessage {
    type?: IFeedbackStatus;
    message?: string;
  }

  export enum IFeedbackStatus {
    success = "SUCCESS",
    error = "ERROR",
    default = ''
  }

  export enum IRoleType {
    admin = "ROLE_ADMIN",
    user = "ROLE_USER",
    superAdmin = 'ROLE_SUPER_ADMIN'
  }

export interface AssetModel {
    modelPath: string;
    modelImgPath: string;
    id: number;
    posx: number;
    posy: number;
    posz: number;
    width: number;
    height: number;
}

export interface AssetTexture {
    texture_path: string;
    id: number;
}

export type Orientation = {
    front: THREE.Vector3,
    back: THREE.Vector3,
    left: THREE.Vector3,
    right: THREE.Vector3,
    top: THREE.Vector3,
    bottom: THREE.Vector3
}

export interface Asset {
    id: number;
    url: string | undefined;
    x: number;
    y: number;
    z: number;
    initialOrientation: Orientation;

    orientation: Orientation;
    // this can be a composed object, the event should have N amounnts of assets to add.
    content: THREE.Object3D;
    size: Size;


    clone: () => Asset;
}
