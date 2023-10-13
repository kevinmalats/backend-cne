export interface RecordMongo {
    id: string;
    name: string;
    code: string;
    totalVoters: number;
    totalAbsenteeism: number;
    candidates: Candidate[];
    totalVotesBlanks: number;
    totalVotesNull: number;
    recordImage: string;
    observations: string;
    status:string;
    isCountFast: boolean;
    idDesk: string;
    idProvince: string;
    idZone: string;
    idCanton: string;
}

export interface Candidate {
    code: string;
    name: string;
    age: number;
    lastName: string;
    party: string;
    votes: number;
    percentage: number;

}