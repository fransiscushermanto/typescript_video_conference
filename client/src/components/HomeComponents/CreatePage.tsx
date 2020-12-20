import React, { Component } from "react";

interface Props {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: any;
  register: any;
  errors: any;
}

class CreatePage extends Component<Props> {
  render() {
    const { handleSubmit, register, errors, setCurrentPage } = this.props;
    return (
      <div className="form-wrapper create">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Name</label>
            <input
              autoComplete="off"
              ref={register}
              className="form-control"
              type="text"
              name="room_name"
            />
            <span className="error">{errors?.room_name?.message}</span>
          </div>
          <button
            className="btn btn-success mb-1"
            type="submit"
            onClick={handleSubmit}
          >
            Create
          </button>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => setCurrentPage("default")}
          >
            Back
          </button>
        </form>
      </div>
    );
  }
}

export default CreatePage;
