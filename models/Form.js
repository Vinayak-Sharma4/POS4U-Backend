import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    mobile: {
        type: String,
        required: true
    },

    fatherName: {
        type: String,
        required: true
    },

    formName: {
        type: String,
        required: true
    },

    fees: {
        type: Number,
        required: true
    },

    document: {
        type: String,
        default: ""
    },

    paymentStatus: {
        type: String,
        enum: [
            "Pending",
            "Paid",
            "Failed"
        ],
        default: "Pending"
    },

    paymentId: {
        type: String,
        default: ""
    },
    orderId: {
    type: String,
    default: ""
},

paymentGateway: {
    type: String,
    default: ""
},

paidAt: {
    type: Date,
    default: null
},

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

},
{
    timestamps: true
}
);

export default mongoose.model("Form", formSchema);