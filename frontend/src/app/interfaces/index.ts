
import * as THREE from 'three';
import { Size } from '../components/evenmodeller3d/modelobjects/3dobjects';

export interface ILoginResponse {
    accessToken: string;
    expiresIn: number
  }

  export interface IResponse<T> {
    data: T;
  }

  export interface ICalendarEvent {
    title: string;                     // Required: The text that will appear on an event
    start: Date | string;              // Required: The event's start date/time
    end: Date | string;                // Required: The event's end date/time

    id?: string | number;              // Optional: Unique identifier for the event
    groupId?: string | number;         // Optional: Group identifier for linking events
    allDay?: boolean;                  // Optional: Specifies if the event is all-day
    daysOfWeek?: number[];             // Optional: Days of the week for recurring events
    startTime?: string;                // Optional: Start time for recurring events (HH:mm:ss format)
    endTime?: string;                  // Optional: End time for recurring events (HH:mm:ss format)
    startRecur?: Date | string;        // Optional: Start date for recurring events
    endRecur?: Date | string;          // Optional: End date for recurring events
    url?: string;                      // Optional: URL to visit on event click
    interactive?: boolean;             // Optional: Tabbable event (default true if URL present)
    className?: string | string[];     // Optional: CSS classes for styling
    editable?: boolean;                // Optional: If the event can be edited
    startEditable?: boolean;           // Optional: Editable start time
    durationEditable?: boolean;        // Optional: Editable duration
    resourceEditable?: boolean;        // Optional: Editable resources
    resourceId?: string;               // Optional: ID of associated resource
    resourceIds?: string[];            // Optional: Array of associated resource IDs
    display?: 'auto' | 'block' | 'list-item' | 'background' | 'inverse-background' | 'none';  // Optional display mode
    overlap?: boolean;                 // Optional: Allows overlap with other events
    constraint?: string | object;      // Optional: Event constraint (groupId, businessHours, or object)
    color?: string;                    // Optional: Background and border color
    backgroundColor?: string;          // Optional: Background color
    borderColor?: string;              // Optional: Border color
    textColor?: string;                // Optional: Text color
    rrule?: string;                    // Optional: RRule for recurrence
    duration?: string;                 // Optional: Event duration (for recurrence)
    extendedProps?: { [key: string]: any };  // Optional: Additional properties

    // Any other properties can be added dynamically
    [key: string]: any;
  }

  export interface IEventType {
    eventTypeId?: number;               // Primary key, optional as it's auto-generated
    eventTypeName?: string;     // Name of the event type
  }
  export interface IEvent {
    eventId?: number;               // Primary key, optional since it's auto-generated
    userId?: number;            // Foreign key referencing the user associated with the event
    eventName?: string;         // Name of the event
    eventType?: IEventType;
    eventDescription?: string;
    eventStartDate?: string;
    eventEndDate?: string;     // Foreign key referencing the type of the event
  }

  export interface IChat{
    id?: number;
    userId?: IUser;
    message?: string;
    roomId?: number;
    // timestamp?: string;

  }

  export interface IVendor{
    id?: number;
    name?: string;
    description?: string;
    location?: string;
    rating?: number;
    user?: IUser;
    phone?: string;
    vendorCategory?: IVendorCategory;
  }



  export interface IVendorService{
    id?: number;
    service_name?: string;
    description?: string;
    price?: number;
    available?: boolean;
    vendor?: IVendor;
  }



  export interface IVendorCategory{
    id?: number;
    category_name?: string;
    description?: string;
  }




  export interface ITask{
    id?:number;
    taskName?: string;
    description?: string;
    creationDate?: string;
    updateDate?: string;
    dueDate?: Date;
    priority?: string;
    status?: string;
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

export interface ICotizacion {
  id?: number;
  event?: IEvent;
  vendor_service_id?: IVendorService;
  montoCotizado?: number;
  cantidadRecurso?: number;
  user?: IUser;
  estado?: 'enviada' | 'aceptada' | 'rechazada';
}

export interface SolicituRecurso {
  id?: number;
  vendor_service_id?: IVendorService;
  user_id?: IUser;
  fechaSolicitud?: Date;
  fechaEvento?: Date;
  horaEvento?: string; // Hora específica del evento
  cantidad_solicitada?: number; // Cantidad solicitada
  estado?: String; // Estado de la solicitud
  event_event_id?: IEvent;
}

export interface IEventForm {
  taskFormId?: number; // Optional because it might be undefined for new forms
  event: IEvent; // Assuming User entity has a numeric ID
  question: IEventFormQuestion;
  answer?: string; // Optional as it's nullable in your entity
}

export interface ITaskTemplate {
  taskTemplateId?: number; // Optional for new entries
  taskTemplateName: string;
  taskTemplateDescription: string;
}

export interface IEventTaskTemplate {
  taskTemplateId?: number; // Optional if created before DB save
  taskTemplate: ITaskTemplate; // Links to the TaskTemplate interface
  event: IEvent; // Numeric ID for User association
}

export interface IEventFormQuestion {
  id: number;
  question: string;
  nnControlName: string;
}

