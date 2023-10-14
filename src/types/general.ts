export type TotalCount = {
    totalVotes: number,
    totalAbsenteeism: number,
    totalVotesBlanks: number,
    totalVotesNull: number,
    firstCandidate: CandidateCount,
    secondCandidate: CandidateCount
}
type CandidateCount = {
    name: string,
    totalVotes: number
}