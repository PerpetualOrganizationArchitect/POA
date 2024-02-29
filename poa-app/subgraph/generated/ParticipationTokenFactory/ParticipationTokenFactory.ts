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

export class TokenCreated extends ethereum.Event {
  get params(): TokenCreated__Params {
    return new TokenCreated__Params(this);
  }
}

export class TokenCreated__Params {
  _event: TokenCreated;

  constructor(event: TokenCreated) {
    this._event = event;
  }

  get tokenAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get name(): string {
    return this._event.parameters[1].value.toString();
  }

  get symbol(): string {
    return this._event.parameters[2].value.toString();
  }

  get POname(): string {
    return this._event.parameters[3].value.toString();
  }
}

export class ParticipationTokenFactory extends ethereum.SmartContract {
  static bind(address: Address): ParticipationTokenFactory {
    return new ParticipationTokenFactory("ParticipationTokenFactory", address);
  }

  deployedTokens(param0: BigInt): Address {
    let result = super.call(
      "deployedTokens",
      "deployedTokens(uint256):(address)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );

    return result[0].toAddress();
  }

  try_deployedTokens(param0: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "deployedTokens",
      "deployedTokens(uint256):(address)",
      [ethereum.Value.fromUnsignedBigInt(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getDeployedTokens(): Array<Address> {
    let result = super.call(
      "getDeployedTokens",
      "getDeployedTokens():(address[])",
      []
    );

    return result[0].toAddressArray();
  }

  try_getDeployedTokens(): ethereum.CallResult<Array<Address>> {
    let result = super.tryCall(
      "getDeployedTokens",
      "getDeployedTokens():(address[])",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddressArray());
  }
}

export class CreateParticipationTokenCall extends ethereum.Call {
  get inputs(): CreateParticipationTokenCall__Inputs {
    return new CreateParticipationTokenCall__Inputs(this);
  }

  get outputs(): CreateParticipationTokenCall__Outputs {
    return new CreateParticipationTokenCall__Outputs(this);
  }
}

export class CreateParticipationTokenCall__Inputs {
  _call: CreateParticipationTokenCall;

  constructor(call: CreateParticipationTokenCall) {
    this._call = call;
  }

  get name(): string {
    return this._call.inputValues[0].value.toString();
  }

  get symbol(): string {
    return this._call.inputValues[1].value.toString();
  }

  get POname(): string {
    return this._call.inputValues[2].value.toString();
  }
}

export class CreateParticipationTokenCall__Outputs {
  _call: CreateParticipationTokenCall;

  constructor(call: CreateParticipationTokenCall) {
    this._call = call;
  }
}