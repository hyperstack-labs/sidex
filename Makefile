# ── SidEx Deployment Makefile ──────────────────────────────────────────────
# Usage:
#   make build           → compile contracts
#   make deploy          → deploy to SidraChain + write out/deployed-addresses.json
#   make verify          → verify on Blockscout (run after deploy)
#   make export-abi      → generate client/src/config/contracts.ts
#   make deploy-all      → build + deploy + export-abi in one shot
#
# Requires: forge, jq, .env file with DEPLOYER_PRIVATE_KEY, FEE_TO_SETTER

-include .env
export

RPC         := https://node.sidrachain.com
CHAIN_ID    := 97453
VERIFIER_URL:= https://ledger.sidrachain.com/api
SCRIPT      := contracts/script/Deploy.s.sol:Deploy

.PHONY: build deploy verify export-abi deploy-all

build:
	@echo "── Building contracts ──────────────────────────────────────────────"
	forge build --root contracts

deploy: build
	@echo "── Deploying to SidraChain ($(CHAIN_ID)) ────────────────────────────"
	forge script $(SCRIPT) \
		--rpc-url $(RPC) \
		--chain-id $(CHAIN_ID) \
		--broadcast \
		--private-key $(DEPLOYER_PRIVATE_KEY) \
		-vvvv

verify:
	@echo "── Verifying on Blockscout ─────────────────────────────────────────"
	@FACTORY=$$(jq -r '.factory' contracts/out/deployed-addresses.json); \
	ROUTER=$$(jq -r '.router'   contracts/out/deployed-addresses.json); \
	echo "Verifying SidExFactory @ $$FACTORY"; \
	forge verify-contract $$FACTORY contracts/src/SidExFactory.sol:SidExFactory \
		--verifier blockscout \
		--verifier-url $(VERIFIER_URL) \
		--chain-id $(CHAIN_ID) \
		--watch; \
	echo "Verifying SidExRouter @ $$ROUTER"; \
	forge verify-contract $$ROUTER contracts/src/SidExRouter.sol:SidExRouter \
		--verifier blockscout \
		--verifier-url $(VERIFIER_URL) \
		--chain-id $(CHAIN_ID) \
		--constructor-args $$(cast abi-encode "constructor(address,address)" $$FACTORY 0x0000000000000000000000000000000000000000) \
		--watch

export-abi:
	@echo "── Exporting ABIs to client/src/config/contracts.ts ──────────────"
	@chmod +x contracts/script/export-abi.sh && bash contracts/script/export-abi.sh

deploy-all: build deploy export-abi
	@echo "Deploy + ABI export complete."
