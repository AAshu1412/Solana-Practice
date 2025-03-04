import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
const IDL = require("../target/idl/voting.json");
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import { expect } from "chai";

const votingAddress = new PublicKey(
  "FGjJWvjxTevMxUaBK4pXGvYr8VupeUUXB2K35ht9BB29"
);

describe("voting", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Voting as Program<Voting>;

  let context;
  let provider;
  let votingProgram;

  before(async () => {
    context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      []
    );

    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(IDL, provider);
  });

  it("Initialize Poll", async () => {
    // Add your test here.
    // const tx = await program.methods.initialize().rpc();
    // console.log("Your transaction signature", tx);

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        "What is your favorite sandwish?",
        new anchor.BN(0),
        new anchor.BN(1840831958)
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).equal(1);
    expect(poll.description).equal("What is your favorite sandwish?");
    expect(poll.pollStart.toNumber()).lessThan(poll.pollEnd.toNumber());
  });

  it("Initialize Candidate", async () => {
    await votingProgram.methods
      .initializeCandidate("Smooth", new anchor.BN(1))
      .rpc();

    await votingProgram.methods
      .initializeCandidate("Crunchy", new anchor.BN(1))
      .rpc();

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Crunchy")],
      votingAddress
    );

    const crunchyCandidate = await votingProgram.account.candidate.fetch(
      crunchyAddress
    );
    expect(crunchyCandidate.candidateVotes.toNumber()).equal(0);
    console.log(crunchyCandidate);

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
      votingAddress
    );

    const smoothCandidate = await votingProgram.account.candidate.fetch(
      smoothAddress
    );
    expect(smoothCandidate.candidateVotes.toNumber()).equal(0);
    console.log(smoothCandidate);

  });

  it("vote", async () => {
    await votingProgram.methods
      .vote("Smooth", new anchor.BN(1))
      .rpc();

    // await votingProgram.methods
    //   .initializeCandidate("Crunchy", new anchor.BN(1))
    //   .rpc();

    // const [crunchyAddress] = PublicKey.findProgramAddressSync(
    //   [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Crunchy")],
    //   votingAddress
    // );

    // const crunchyCandidate = await votingProgram.account.candidate.fetch(
    //   crunchyAddress
    // );
    // expect(crunchyCandidate.candidateVotes.toNumber()).equal(0);
    // console.log(crunchyCandidate);

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
      votingAddress
    );

    const smoothCandidate = await votingProgram.account.candidate.fetch(
      smoothAddress
    );
    expect(smoothCandidate.candidateVotes.toNumber()).equal(1);
    console.log(smoothCandidate);

  });
});
