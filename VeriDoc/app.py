import streamlit as st
from main import get_response

st.set_page_config(page_title="Air India Assistant", layout="wide")

st.title("✈️ Air India Chat Assistant")
st.markdown("Ask any question about Air India based on the provided documents.")

st# Input field
question = st.text_input("Enter your question:")

# When the user submits a question
if st.button("Ask"):
    if question.strip() == "":
        st.warning("Please enter a question.")
    else:
        with st.spinner("Generating answer..."):
            try:
                result = get_response(question)
                st.markdown("### 📄 Answer")
                st.write(result['output']['message']['content'][0]['text'])
            except Exception as e:
                st.error(f"An error occurred: {e}")
