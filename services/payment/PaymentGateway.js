class PaymentGateway {

    async createOrder() {
        throw new Error("createOrder() not implemented");
    }

    async verifyPayment() {
        throw new Error("verifyPayment() not implemented");
    }

}

export default PaymentGateway;