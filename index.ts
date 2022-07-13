import * as crypto from 'crypto'

class Transaction {
    constructor(
        public amount: number,
        public payer: string,
        public payee: string
    ) { }

    toString() {
        return JSON.stringify(this)
    }

}

class Block {
    public nonce = Math.round(Math.random() * 999999999)
    constructor(
        public prevHash: string | null,
        public transaction: Transaction,
        public ts = Date.now()
    ) { }

    get hash() {
        const str = JSON.stringify(this)
        const hash = crypto.createHash('sha256')
        hash.update(str).end()
        return hash.digest('hex')

    }
}

class Chain {
    public static instance = new Chain()
    chain: Block[]

    constructor() {
        const transaction = new Transaction(100, 'turki', 'anoud')
        this.chain = [new Block(null, transaction)]

    }

    get lastBlock() {
        return this.chain[this.chain.length - 1]
    }

    addBlock(transaction: Transaction, senderPublicKey: string, signature: string) {
        const verifier = crypto.createVerify('SHA256')
        verifier.update(transaction.toString())

        const isValid = verifier.verify(senderPublicKey, signature)

        if (isValid) {
            const newBlock = new Block(this.lastBlock.hash, transaction)
            this.chain.push(newBlock)
        }
    }
    mine(nonce: number) {
        let solution = 1
        console.log("Mining")

        while (true) {
            const hash = crypto.createHash("MD5")
            hash.update((nonce + solution).toString()).end()

            const attempt = hash.digest('hex')

            if (attempt.substr(0, 4) === '0000') {
                console.log(`solved : ${solution}`)
                return solution
            }

            solution += 1

        }
    }

}

class Wallet {
    public publicKey: string
    public privateKey: string

    constructor() {
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        })

        this.privateKey = keyPair.privateKey
        this.publicKey = keyPair.publicKey
    }

    sendMoeny(amount: number, payeePublicKey: string) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey)

        const sign = crypto.createSign('SHA256')

        sign.update(transaction.toString()).end()

        const signature = sign.sign(this.privateKey).toString() // change later
        Chain.instance.addBlock(transaction, this.publicKey, signature)
    }

}

const turki = new Wallet()
const alice = new Wallet()
const bob = new Wallet()

turki.sendMoeny(50, bob.publicKey)
alice.sendMoeny(100, turki.publicKey)
console.log(Chain.instance)