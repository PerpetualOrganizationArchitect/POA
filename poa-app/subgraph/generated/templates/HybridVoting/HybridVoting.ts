// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class NewProposal extends ethereum.Event {
  get params(): NewProposal__Params {
    return new NewProposal__Params(this);
  }
}

export class NewProposal__Params {
  _event: NewProposal;

  constructor(event: NewProposal) {
    this._event = event;
  }

  get proposalId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get name(): string {
    return this._event.parameters[1].value.toString();
  }

  get description(): string {
    return this._event.parameters[2].value.toString();
  }

  get timeInMinutes(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get creationTimestamp(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get transferTriggerOptionIndex(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get transferRecipient(): Address {
    return this._event.parameters[6].value.toAddress();
  }

  get transferAmount(): BigInt {
    return this._event.parameters[7].value.toBigInt();
  }

  get transferEnabled(): boolean {
    return this._event.parameters[8].value.toBoolean();
  }
}

export class PollOptionNames extends ethereum.Event {
  get params(): PollOptionNames__Params {
    return new PollOptionNames__Params(this);
  }
}

export class PollOptionNames__Params {
  _event: PollOptionNames;

  constructor(event: PollOptionNames) {
    this._event = event;
  }

  get proposalId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get optionIndex(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get name(): string {
    return this._event.parameters[2].value.toString();
  }
}

export class Voted extends ethereum.Event {
  get params(): Voted__Params {
    return new Voted__Params(this);
  }
}

export class Voted__Params {
  _event: Voted;

  constructor(event: Voted) {
    this._event = event;
  }

  get proposalId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get voter(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get optionIndex(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get voteWeightPT(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get voteWeightDDT(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class WinnerAnnounced extends ethereum.Event {
  get params(): WinnerAnnounced__Params {
    return new WinnerAnnounced__Params(this);
  }
}

export class WinnerAnnounced__Params {
  _event: WinnerAnnounced;

  constructor(event: WinnerAnnounced) {
    this._event = event;
  }

  get proposalId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get winningOptionIndex(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get hasValidWinner(): boolean {
    return this._event.parameters[2].value.toBoolean();
  }
}

export class HybridVoting__getOptionVotesResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  getVotesPT(): BigInt {
    return this.value0;
  }

  getVotesDDT(): BigInt {
    return this.value1;
  }
}

export class HybridVoting extends ethereum.SmartContract {
  static bind(address: Address): HybridVoting {
    return new HybridVoting("HybridVoting", address);
  }

  DirectDemocracyToken(): Address {
    let result = super.call(
      "DirectDemocracyToken",
      "DirectDemocracyToken():(address)",
      [],
    );

    return result[0].toAddress();
  }

  try_DirectDemocracyToken(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "DirectDemocracyToken",
      "DirectDemocracyToken():(address)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  ParticipationToken(): Address {
    let result = super.call(
      "ParticipationToken",
      "ParticipationToken():(address)",
      [],
    );

    return result[0].toAddress();
  }

  try_ParticipationToken(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "ParticipationToken",
      "ParticipationToken():(address)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  democracyVoteWeight(): BigInt {
    let result = super.call(
      "democracyVoteWeight",
      "democracyVoteWeight():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_democracyVoteWeight(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "democracyVoteWeight",
      "democracyVoteWeight():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getOptionVotes(
    _proposalId: BigInt,
    _optionIndex: BigInt,
  ): HybridVoting__getOptionVotesResult {
    let result = super.call(
      "getOptionVotes",
      "getOptionVotes(uint256,uint256):(uint256,uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(_proposalId),
        ethereum.Value.fromUnsignedBigInt(_optionIndex),
      ],
    );

    return new HybridVoting__getOptionVotesResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
    );
  }

  try_getOptionVotes(
    _proposalId: BigInt,
    _optionIndex: BigInt,
  ): ethereum.CallResult<HybridVoting__getOptionVotesResult> {
    let result = super.tryCall(
      "getOptionVotes",
      "getOptionVotes(uint256,uint256):(uint256,uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(_proposalId),
        ethereum.Value.fromUnsignedBigInt(_optionIndex),
      ],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new HybridVoting__getOptionVotesResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
      ),
    );
  }

  getOptionsCount(_proposalId: BigInt): BigInt {
    let result = super.call(
      "getOptionsCount",
      "getOptionsCount(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(_proposalId)],
    );

    return result[0].toBigInt();
  }

  try_getOptionsCount(_proposalId: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getOptionsCount",
      "getOptionsCount(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(_proposalId)],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  nftMembership(): Address {
    let result = super.call("nftMembership", "nftMembership():(address)", []);

    return result[0].toAddress();
  }

  try_nftMembership(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "nftMembership",
      "nftMembership():(address)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  participationVoteWeight(): BigInt {
    let result = super.call(
      "participationVoteWeight",
      "participationVoteWeight():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_participationVoteWeight(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "participationVoteWeight",
      "participationVoteWeight():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  quadraticVotingEnabled(): boolean {
    let result = super.call(
      "quadraticVotingEnabled",
      "quadraticVotingEnabled():(bool)",
      [],
    );

    return result[0].toBoolean();
  }

  try_quadraticVotingEnabled(): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "quadraticVotingEnabled",
      "quadraticVotingEnabled():(bool)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  quorumPercentage(): BigInt {
    let result = super.call(
      "quorumPercentage",
      "quorumPercentage():(uint256)",
      [],
    );

    return result[0].toBigInt();
  }

  try_quorumPercentage(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "quorumPercentage",
      "quorumPercentage():(uint256)",
      [],
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  treasury(): Address {
    let result = super.call("treasury", "treasury():(address)", []);

    return result[0].toAddress();
  }

  try_treasury(): ethereum.CallResult<Address> {
    let result = super.tryCall("treasury", "treasury():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _ParticipationToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _DemocracyToken(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _nftMembership(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _allowedRoleNames(): Array<string> {
    return this._call.inputValues[3].value.toStringArray();
  }

  get _quadraticVotingEnabled(): boolean {
    return this._call.inputValues[4].value.toBoolean();
  }

  get _democracyVoteWeight(): BigInt {
    return this._call.inputValues[5].value.toBigInt();
  }

  get _participationVoteWeight(): BigInt {
    return this._call.inputValues[6].value.toBigInt();
  }

  get _treasuryAddress(): Address {
    return this._call.inputValues[7].value.toAddress();
  }

  get _quorumPercentage(): BigInt {
    return this._call.inputValues[8].value.toBigInt();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class AnnounceWinnerCall extends ethereum.Call {
  get inputs(): AnnounceWinnerCall__Inputs {
    return new AnnounceWinnerCall__Inputs(this);
  }

  get outputs(): AnnounceWinnerCall__Outputs {
    return new AnnounceWinnerCall__Outputs(this);
  }
}

export class AnnounceWinnerCall__Inputs {
  _call: AnnounceWinnerCall;

  constructor(call: AnnounceWinnerCall) {
    this._call = call;
  }

  get _proposalId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class AnnounceWinnerCall__Outputs {
  _call: AnnounceWinnerCall;

  constructor(call: AnnounceWinnerCall) {
    this._call = call;
  }
}

export class CreateProposalCall extends ethereum.Call {
  get inputs(): CreateProposalCall__Inputs {
    return new CreateProposalCall__Inputs(this);
  }

  get outputs(): CreateProposalCall__Outputs {
    return new CreateProposalCall__Outputs(this);
  }
}

export class CreateProposalCall__Inputs {
  _call: CreateProposalCall;

  constructor(call: CreateProposalCall) {
    this._call = call;
  }

  get _name(): string {
    return this._call.inputValues[0].value.toString();
  }

  get _description(): string {
    return this._call.inputValues[1].value.toString();
  }

  get _timeInMinutes(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _optionNames(): Array<string> {
    return this._call.inputValues[3].value.toStringArray();
  }

  get _transferTriggerOptionIndex(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }

  get _transferRecipient(): Address {
    return this._call.inputValues[5].value.toAddress();
  }

  get _transferAmount(): BigInt {
    return this._call.inputValues[6].value.toBigInt();
  }

  get _transferEnabled(): boolean {
    return this._call.inputValues[7].value.toBoolean();
  }
}

export class CreateProposalCall__Outputs {
  _call: CreateProposalCall;

  constructor(call: CreateProposalCall) {
    this._call = call;
  }
}

export class VoteCall extends ethereum.Call {
  get inputs(): VoteCall__Inputs {
    return new VoteCall__Inputs(this);
  }

  get outputs(): VoteCall__Outputs {
    return new VoteCall__Outputs(this);
  }
}

export class VoteCall__Inputs {
  _call: VoteCall;

  constructor(call: VoteCall) {
    this._call = call;
  }

  get _proposalId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _voter(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _optionIndex(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class VoteCall__Outputs {
  _call: VoteCall;

  constructor(call: VoteCall) {
    this._call = call;
  }
}
