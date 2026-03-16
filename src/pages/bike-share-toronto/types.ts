export interface Station {
  id: number;
  lat: number;
  lng: number;
  name: string;
  cap: number;
}

export interface Trip {
  from: Station;
  to: Station;
  progress: number;
  speed: number;
  member: boolean;
  ebike: boolean;
  alpha: number;
}

export interface Filters {
  member: boolean;
  casual: boolean;
  ebike: boolean;
  classic: boolean;
}

export const HOUR_PROFILE: number[] = [
  0.04, 0.02, 0.01, 0.01, 0.02, 0.06,
  0.15, 0.55, 0.90, 0.65, 0.50, 0.60,
  0.75, 0.65, 0.55, 0.60, 0.70, 0.95,
  1.00, 0.80, 0.65, 0.45, 0.28, 0.12,
];

export const PERIOD_LABELS: string[] = [
  'Late Night','Late Night','Late Night','Late Night','Late Night','Early Morning',
  'Early Morning','Morning Rush','Morning Rush','Mid-Morning','Mid-Morning','Midday',
  'Lunch','Early Afternoon','Afternoon','Afternoon','Evening Rush','Evening Rush',
  'Evening Peak','Evening','Evening','Night','Night','Late Night',
];

export const MAP_BOUNDS = {
  minLat: 43.595, maxLat: 43.730,
  minLng: -79.520, maxLng: -79.290,
};

export const STATIONS: Station[] = [
  {id:7000,lat:43.6426,lng:-79.3871,name:"Bay St / Queens Quay W",cap:27},
  {id:7001,lat:43.6389,lng:-79.3800,name:"Lower Jarvis / Queens Quay",cap:23},
  {id:7002,lat:43.6435,lng:-79.4000,name:"Rees St / Queens Quay W",cap:15},
  {id:7003,lat:43.6375,lng:-79.3720,name:"Sherbourne St / Queens Quay",cap:19},
  {id:7004,lat:43.6455,lng:-79.4100,name:"Fort York Blvd / Capreol Crt",cap:23},
  {id:7010,lat:43.6453,lng:-79.3806,name:"Union Station / Front St W",cap:35},
  {id:7011,lat:43.6481,lng:-79.3836,name:"King St W / Bay St",cap:27},
  {id:7012,lat:43.6517,lng:-79.3831,name:"Queen St W / Bay St",cap:23},
  {id:7013,lat:43.6544,lng:-79.3800,name:"Yonge St / Dundas Sq",cap:31},
  {id:7014,lat:43.6490,lng:-79.3770,name:"King St E / Jarvis St",cap:19},
  {id:7020,lat:43.6448,lng:-79.3978,name:"Bathurst St / Front St W",cap:15},
  {id:7021,lat:43.6463,lng:-79.4057,name:"Strachan Ave / King St W",cap:19},
  {id:7022,lat:43.6490,lng:-79.3920,name:"Spadina Ave / King St W",cap:23},
  {id:7023,lat:43.6450,lng:-79.3855,name:"John St / King St W",cap:15},
  {id:7030,lat:43.6530,lng:-79.4005,name:"Augusta Ave / College St",cap:19},
  {id:7031,lat:43.6558,lng:-79.4032,name:"Spadina Ave / College St",cap:23},
  {id:7032,lat:43.6524,lng:-79.3963,name:"Kensington Ave / Dundas St W",cap:15},
  {id:7040,lat:43.6590,lng:-79.3936,name:"University Ave / College St",cap:27},
  {id:7041,lat:43.6612,lng:-79.3957,name:"McCaul St / College St",cap:19},
  {id:7042,lat:43.6570,lng:-79.3888,name:"Bay St / College St",cap:23},
  {id:7050,lat:43.6681,lng:-79.3984,name:"Spadina Ave / Bloor St W",cap:27},
  {id:7051,lat:43.6698,lng:-79.3926,name:"Huron St / Bloor St W",cap:15},
  {id:7052,lat:43.6706,lng:-79.3858,name:"Bay St / Bloor St W",cap:27},
  {id:7053,lat:43.6714,lng:-79.3800,name:"Yonge St / Bloor St E",cap:31},
  {id:7060,lat:43.6739,lng:-79.3870,name:"Yonge St / Rosedale",cap:15},
  {id:7061,lat:43.6718,lng:-79.3931,name:"Bellair St / Yorkville",cap:19},
  {id:7070,lat:43.6603,lng:-79.3490,name:"Queen St E / Broadview",cap:19},
  {id:7071,lat:43.6557,lng:-79.3400,name:"Gerrard St E / Leslie",cap:15},
  {id:7072,lat:43.6630,lng:-79.3600,name:"Danforth / Logan",cap:19},
  {id:7080,lat:43.6382,lng:-79.4212,name:"Dufferin St / King St W",cap:23},
  {id:7081,lat:43.6408,lng:-79.4178,name:"Liberty Village / East Liberty",cap:27},
  {id:7082,lat:43.6432,lng:-79.4280,name:"Dufferin / Springhurst",cap:15},
  {id:7090,lat:43.6503,lng:-79.3608,name:"Distillery District / Mill St",cap:27},
  {id:7091,lat:43.6478,lng:-79.3693,name:"St Lawrence Market / King E",cap:23},
  {id:7092,lat:43.6533,lng:-79.3640,name:"Parliament St / King E",cap:15},
  {id:7100,lat:43.6229,lng:-79.3784,name:"Billy Bishop Airport Ferry",cap:11},
  {id:7101,lat:43.6272,lng:-79.3642,name:"Cherry Beach / Unwin",cap:15},
  {id:7102,lat:43.6310,lng:-79.3556,name:"Leslie St Spit",cap:11},
  {id:7110,lat:43.6980,lng:-79.3953,name:"Eglinton Ave W / Avenue Rd",cap:19},
  {id:7111,lat:43.7050,lng:-79.3990,name:"Lawrence Ave W / Yonge",cap:15},
  {id:7112,lat:43.6896,lng:-79.4050,name:"St Clair Ave W / Yonge",cap:23},
  {id:7120,lat:43.6491,lng:-79.4230,name:"Trinity Bellwoods / Queen W",cap:23},
  {id:7121,lat:43.6466,lng:-79.4300,name:"Dufferin / Queen W",cap:15},
  {id:7122,lat:43.6519,lng:-79.4175,name:"Ossington / Dundas W",cap:19},
  {id:7130,lat:43.7258,lng:-79.4128,name:"Yonge / Sheppard",cap:27},
  {id:7131,lat:43.7222,lng:-79.4058,name:"Willowdale Ave / Sheppard",cap:19},
  {id:7140,lat:43.6834,lng:-79.2970,name:"Kingston Rd / Victoria Park",cap:15},
  {id:7141,lat:43.6778,lng:-79.3090,name:"Danforth / Warden",cap:19},
  {id:7150,lat:43.6382,lng:-79.4452,name:"Roncesvalles / Queen W",cap:19},
  {id:7151,lat:43.6408,lng:-79.4350,name:"Lansdowne / Queen W",cap:15},
];

export interface RealTrip {
  from: Station;
  to: Station;
  startHour: number;
  startMinute: number;
  durationSeconds: number;
  isMember: boolean;
  isEbike: boolean;
}

export interface HourlyBucket {
  hour: number;
  trips: RealTrip[];
  count: number;
}

export interface TripsDataState {
  stations: Map<number, Station>;
  hourlyBuckets: HourlyBucket[];
  totalTrips: number;
  availableMonths: string[];
  currentMonth: string;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}
