import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: {},
};

export const variationSlice = createSlice({
  name: "variation",
  initialState,
  reducers: {
    initializeVariants: (state, action) => {
      const { id, qty } = action.payload;
      if (state.products[id]) {
        // const sameInfo = state.products[id].sameForAll;
        const currQty = state.products[id].variants.length;
        if (qty > currQty) {
          const baseVariant = state.products[id].variants[0];
          const additional = Array.from({ length: qty - currQty }, () => ({
            ...baseVariant,
          }));
          state.products[id].variants.push(...additional);
        } else if (qty < currQty) {
          state.products[id].variants.pop();
          if (state.products[id].activeIndex > 0) {
            state.products[id].activeIndex = state.products[id].activeIndex - 1;
          }
        }
      } else {
        const newVariations = Array.from({ length: qty }, () => ({
          region: "",
          serial: "",
          color: "",
          color_code: "",
          retails_price: "",
          last_price: "",
          purchase_price: "",
          wholesale_price: "",
          storage: "",
          quantity: 1,
          battery_life: "",
          model: "",
          warranty: "",
          image_path: "",
          product_condition: "",
          product_id: id,
          note: "",
        }));

        state.products[id] = {
          activeIndex: 0,
          variants: newVariations,
          sameForAll: false,
        };
      }
    },
    updateVariants: (state, action) => {
      const { id, field, value, index } = action.payload;
      const product = state.products[id];
      if (!product) return;
      product.variants[index][field] = value;
      const unique = ["serial"];
      if (index === 0 && product.sameForAll) {
        for (let i = 1; i < product.variants.length; i++) {
          Object.keys(product.variants[0]).forEach((key) => {
            if (!unique.includes(key)) {
              product.variants[i][key] = product.variants[0][key];
            }
          });
        }
      }
    },
    removeVariation: (state, action) => {
      const id = action.payload;
      delete state.products[id];
    },
    setActiveIndex: (state, action) => {
      const { id, index } = action.payload;
      if (state.products[id]) {
        state.products[id].activeIndex = index;
      }
    },
    setSameInfo: (state, action) => {
      const { id, sameForAll } = action.payload;
      if (state.products[id]) {
        state.products[id].sameForAll = sameForAll;
      }
    },
    clearAllVariations: (state) => {
      state.products = {};
    },
  },
});

export const {
  initializeVariants,
  updateVariants,
  setActiveIndex,
  removeVariation,
  setSameInfo,
  clearAllVariations,
} = variationSlice.actions;

export default variationSlice.reducer;
