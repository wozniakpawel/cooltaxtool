import { OverlayTrigger, Popover, Button } from "react-bootstrap";

interface InfoPopoverProps {
  title: string;
  content: string;
}

const InfoPopover = ({ title, content }: InfoPopoverProps) => {
  const popover = (
    <Popover>
      <Popover.Header as="h3">{title}</Popover.Header>
      <Popover.Body>{content}</Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger trigger="click" placement="auto" overlay={popover} rootClose>
      <Button
        variant="outline-secondary"
        size="sm"
        className="rounded-circle p-0 ms-1"
        style={{ width: "1.4em", height: "1.4em", fontSize: "0.75rem", lineHeight: "1" }}
        aria-label="info"
      >
        i
      </Button>
    </OverlayTrigger>
  );
};

export default InfoPopover;
