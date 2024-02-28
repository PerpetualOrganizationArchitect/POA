// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class EtherWithdrawn extends ethereum.Event {
  get params(): EtherWithdrawn__Params {
    return new EtherWithdrawn__Params(this);
  }
}

export class EtherWithdrawn__Params {
  _event: EtherWithdrawn;

  constructor(event: EtherWithdrawn) {
    this._event = event;
  }

  get to(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class TokensReceived extends ethereum.Event {
  get params(): TokensReceived__Params {
    return new TokensReceived__Params(this);
  }
}

export class TokensReceived__Params {
  _event: TokensReceived;

  constructor(event: TokensReceived) {
    this._event = event;
  }

  get token(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get from(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class TokensSent extends ethereum.Event {
  get params(): TokensSent__Params {
    return new TokensSent__Params(this);
  }
}

export class TokensSent__Params {
  _event: TokensSent;

  constructor(event: TokensSent) {
    this._event = event;
  }

  get token(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class VotingContractSet extends ethereum.Event {
  get params(): VotingContractSet__Params {
    return new VotingContractSet__Params(this);
  }
}

export class VotingContractSet__Params {
  _event: VotingContractSet;

  constructor(event: VotingContractSet) {
    this._event = event;
  }

  get votingContract(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class Treasury extends ethereum.SmartContract {
  static bind(address: Address): Treasury {
    return new Treasury("Treasury", address);
  }

  votingContract(): Address {
    let result = super.call("votingContract", "votingContract():(address)", []);

    return result[0].toAddress();
  }

  try_votingContract(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "votingContract",
      "votingContract():(address)",
      []
    );
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
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ReceiveTokensCall extends ethereum.Call {
  get inputs(): ReceiveTokensCall__Inputs {
    return new ReceiveTokensCall__Inputs(this);
  }

  get outputs(): ReceiveTokensCall__Outputs {
    return new ReceiveTokensCall__Outputs(this);
  }
}

export class ReceiveTokensCall__Inputs {
  _call: ReceiveTokensCall;

  constructor(call: ReceiveTokensCall) {
    this._call = call;
  }

  get _token(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _from(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class ReceiveTokensCall__Outputs {
  _call: ReceiveTokensCall;

  constructor(call: ReceiveTokensCall) {
    this._call = call;
  }
}

export class SendTokensCall extends ethereum.Call {
  get inputs(): SendTokensCall__Inputs {
    return new SendTokensCall__Inputs(this);
  }

  get outputs(): SendTokensCall__Outputs {
    return new SendTokensCall__Outputs(this);
  }
}

export class SendTokensCall__Inputs {
  _call: SendTokensCall;

  constructor(call: SendTokensCall) {
    this._call = call;
  }

  get _token(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _to(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class SendTokensCall__Outputs {
  _call: SendTokensCall;

  constructor(call: SendTokensCall) {
    this._call = call;
  }
}

export class SetVotingContractCall extends ethereum.Call {
  get inputs(): SetVotingContractCall__Inputs {
    return new SetVotingContractCall__Inputs(this);
  }

  get outputs(): SetVotingContractCall__Outputs {
    return new SetVotingContractCall__Outputs(this);
  }
}

export class SetVotingContractCall__Inputs {
  _call: SetVotingContractCall;

  constructor(call: SetVotingContractCall) {
    this._call = call;
  }

  get _votingContract(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetVotingContractCall__Outputs {
  _call: SetVotingContractCall;

  constructor(call: SetVotingContractCall) {
    this._call = call;
  }
}

export class WithdrawEtherCall extends ethereum.Call {
  get inputs(): WithdrawEtherCall__Inputs {
    return new WithdrawEtherCall__Inputs(this);
  }

  get outputs(): WithdrawEtherCall__Outputs {
    return new WithdrawEtherCall__Outputs(this);
  }
}

export class WithdrawEtherCall__Inputs {
  _call: WithdrawEtherCall;

  constructor(call: WithdrawEtherCall) {
    this._call = call;
  }

  get _to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class WithdrawEtherCall__Outputs {
  _call: WithdrawEtherCall;

  constructor(call: WithdrawEtherCall) {
    this._call = call;
  }
}
