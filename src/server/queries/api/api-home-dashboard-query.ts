import "server-only";
import facilitiesMap from "@/public_resources/facilities-map.png";
import type { ActivityRecord, ActivityStatus, ActivityType } from "@/src/domain/entities/activity";
import { activityCategoryStylesById, defaultActivityCategoryStyle, getActivityCategoryStyle } from "@/src/domain/entities/activity";
import type { HomeDashboardQuery, HomeDateRange } from "@/src/server/queries/home-dashboard/home-dashboard-query";
import { backendJson } from "@/src/server/api-client";
const fmt=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Sao_Paulo"});
type Raw={id:number;request_type:string|null;business_unit:string|null;category_id:number|null;category:string|null;service:string|null;location:string|null;status:string;status_date:string|null;agreed_date:string|null;map_x:number|null;map_y:number|null};
type Metrics={equipment:{categoryId:number;categoryName:string;planned:number;inProgress:number;completed:number}[];handlingMinutes:number[]};
const qs=(d:HomeDateRange)=>{const q=new URLSearchParams({start_date:d.startDate,end_date:d.endDate});d.statuses?.forEach(v=>q.append("status",v));d.businessUnits?.forEach(v=>q.append("business_unit",String(v)));return q};
async function activities(d:HomeDateRange):Promise<ActivityRecord[]>{return (await backendJson<Raw[]>(`/requests/activities?${qs(d)}`)).map(r=>({id:String(r.id),activityType:(r.request_type==="Atividade no Pátio"?"Atividade no Pátio":"Chamado") as ActivityType,businessUnit:r.business_unit??"Não informado",categoryId:r.category_id,category:r.category??"Não informado",serviceType:r.service??"Não informado",location:r.location??"Não informado",status:(r.status==="Concluida"?"Concluída":r.status) as ActivityStatus,statusDate:r.status_date?fmt.format(new Date(r.status_date)):"Não informado",plannedAt:r.agreed_date?fmt.format(new Date(r.agreed_date)):"Não informado",mapPosition:{x:Number(r.map_x??0),y:Number(r.map_y??0)}}))}
async function metrics(d:HomeDateRange){return backendJson<Metrics>(`/requests/home-metrics?start_date=${encodeURIComponent(d.startDate)}&end_date=${encodeURIComponent(d.endDate)}`)}
export const apiHomeDashboardQuery:HomeDashboardQuery={
 async findEquipmentCards(d){return (await metrics(d)).equipment.map(r=>{const s=getActivityCategoryStyle(r.categoryId);return{title:r.categoryName,accent:s.accent,iconBg:s.iconBg,Planned:r.planned,InProgress:r.inProgress,Completed:r.completed,total:r.planned+r.inProgress+r.completed}})},
 findActivityRecords:activities,
 async findCategoryColorMap(){return Object.fromEntries([...Object.entries(activityCategoryStylesById).map(([id,s])=>[id,s.color]),["default",defaultActivityCategoryStyle.color]])},
 async findMapImage(){return{src:process.env.FACILITIES_MAP_SRC??facilitiesMap.src,width:Number(process.env.FACILITIES_MAP_WIDTH??facilitiesMap.width),height:Number(process.env.FACILITIES_MAP_HEIGHT??facilitiesMap.height),alt:"Mapa AIS com posições atuais das atividades de facilities"}},
 async findHandlingTimeSamplesInMinutes(d){return(await metrics(d)).handlingMinutes},
};
